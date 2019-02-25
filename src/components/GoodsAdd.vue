<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert title="添加商品需要仔细填写 !!!" type="warning" center show-icon :closable="false"></el-alert>

      <el-steps :active="activeName-0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="160px">
        <el-tabs
          tab-position="left"
          @tab-click="tabClicked"
          v-model="activeName"
          :before-leave="tabBeforeLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="catInfos"
                :props="catInfosProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyParams" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item2"
                  :key="i2+''+Math.random()"
                  v-for="(item2,i2) in item.attr_vals"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyParams" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :headers="uploadHeaders"
              :on-success="uploadSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce" ref="myQuillEditor"></quill-editor>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览 -->
      <el-dialog title="大图" :visible.sync="previewVisible" width="30%">
        <img :src="previewImg" alt class="img-preview">
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { quillEditor } from 'vue-quill-editor'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入lodash
import _ from 'lodash'

export default {
  components: {
    quillEditor
  },
  methods: {
    // 提交数据
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          // console.log(this.addForm)
          // 复制一份addForm
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join()
          // 处理 动态参数信息
          this.manyParams.forEach(item => {
            if (item.attr_vals.length > 0) {
              var newObj = {
                attr_id: item.attr_id,
                attr_value: item.attr_vals.join(' ')
              }
              form.attrs.push(newObj)
            }
          })
          // 处理 静态属性信息
          this.onlyParams.forEach(item => {
            if (item.attr_vals.trim()) {
              var newObj = {
                attr_id: item.attr_id,
                attr_value: item.attr_vals.trim()
              }
              form.attrs.push(newObj)
            }
          })
          // console.log(form)
          const { data: res } = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          this.$router.push('goods')
        }
      })
    },
    // 上传图片
    async uploadSuccess(res) {
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.addForm.pics.push({ pic: res.data.tmp_path })
      this.previewImg = res.data.url
    },
    // 图片预览
    handlePreview() {
      this.previewVisible = true
    },
    // 删除图片
    handleRemove(res) {
      // console.log(res)
      if (res.status !== 'success') {
        return this.$message.error('图片删除失败')
      }
      // 从pics中获取被删除所在的下标
      var i = this.addForm.pics.findIndex(item => {
        return item.pic === res.response.data.tmp_path
      })
      // 把图片路径名从pics中删除
      this.addForm.pics.splice(i, 1)
    },
    // 离开tabs之前,判断是否选择第三分类
    tabBeforeLeave(newTab, oldTab) {
      if (oldTab === '0' && this.catThreeId === 0) {
        this.$message.error('请选取第三级商品分类')
        return false
      }
    },
    // 侧边tabs点击事件
    async tabClicked() {
      if (this.activeName === '1') {
        const { data: res } = await this.$http.get(
          'categories/' + this.catThreeId + '/attributes',
          { params: { sel: 'many' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 把attr_vals由空格分割的字符串 变为数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyParams = res.data
      } else if (this.activeName === '2') {
        const { data: res } = await this.$http.get(
          'categories/' + this.catThreeId + '/attributes',
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.onlyParams = res.data
      }
    },
    // 级联选择器内容发生变化
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.catThreeId = 0
      }
      this.catThreeId = this.addForm.goods_cat[2]
    },
    // 获取分类信息
    async getCatInfos() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 3 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.catInfos = res.data
    }
  },
  data() {
    return {
      // 上传图片数据
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览
      previewImg: '',
      previewVisible: false,
      // 添加商品表单数据
      addForm: {
        goods_name: '',
        goods_cat: [],
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      manyParams: [],
      onlyParams: [],
      // 进度条当前进度
      activeName: '0',
      // 级联选择器相关参数
      catInfos: [],
      catThreeId: 0,
      catInfosProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created() {
    this.getCatInfos()
  }
}
</script>

<style lang="less" scoped>
.el-tabs,
.el-step {
  margin: 20px 0;
}
.el-step__title {
  font-size: 12px;
}
.el-button {
  margin-top: 15px;
}
// 预览图片img标签样式
.img-preview {
  width: 100%;
}
</style>
