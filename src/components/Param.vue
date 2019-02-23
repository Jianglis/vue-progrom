<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <el-row>
        <span>选择商品分类：</span>
        <el-cascader
          expand-trigger="hover"
          :options="catInfos"
          :props="catInfosProps"
          v-model="selectedCat"
          @change="handleChange"
          clearable
        ></el-cascader>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="showButton" @click="showAddDialog">添加参数</el-button>
          <el-table :data="manyParamInfos" border>
            <el-table-column type="expand">
              <template slot-scope="info">
                <el-tag
                  :key="tag + '' + Math.random()"
                  v-for="(tag,i) in info.row.attr_vals"
                  closable
                  :disable-transitions="true"
                  @close="handleClose(info.row,i)"
                >{{tag}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(info.row)"
                  @blur="handleInputConfirm(info.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="info">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(info.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParam(info.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="showButton" @click="showAddDialog">添加属性</el-button>
          <el-table :data="onlyParamInfos" border>
            <el-table-column type="expand">
              <template slot-scope="info">
                <el-tag
                  :key="tag + '' + Math.random()"
                  v-for=" (tag,i) in info.row.attr_vals"
                  closable
                  :disable-transitions="true"
                  @close="handleClose(info.row,i)"
                >{{tag}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(info.row)"
                  @blur="handleInputConfirm(info.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="info">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(info.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParam(info.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数/属性对话框 -->
      <el-dialog
        :title="'添加'+ (activeName === 'many'? '动态参数' : '静态属性') "
        :visible.sync="addDialogVisible"
        width="30%"
        @close="addDialogClose"
      >
        <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
          <el-form-item :label="activeName === 'many'? '动态参数' : '静态属性'" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParam">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑参数/属性对话框 -->
      <el-dialog
        :title="'修改'+ (activeName === 'many'? '动态参数' : '静态属性') "
        :visible.sync="editDialogVisible"
        width="30%"
        @close="editDialogClose"
      >
        <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
          <el-form-item :label="activeName === 'many'? '动态参数' : '静态属性'" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParam">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  methods: {
    // 添加参数
    // 显示添加对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 提交添加对话框内容
    addParam() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(
            'categories/' + this.catThreeId + '/attributes',
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            }
          )
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.addDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getParamInfos()
        }
      })
    },
    // 关闭添加对话框
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 编辑分类
    // 显示编辑对话框
    async showEditDialog(attrId) {
      // console.log(attrId)
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(
        `categories/${this.catThreeId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
    },
    // 提交编辑对话框内容
    editParam() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            `categories/${this.catThreeId}/attributes/${this.editForm.attr_id}`,
            this.editForm
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.editDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getParamInfos()
        }
      })
    },
    // 关闭编辑对话框
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 删除参数
    delParam(attrId) {
      this.$confirm('此操作将永久删除该参数/属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete(
            `categories/${this.catThreeId}/attributes/${attrId}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          this.getParamInfos()
        })
        .catch(() => {})
    },

    // 参数 tag标签 可选项
    // 删除参数可选项tag标签
    async handleClose(nowParam, index) {
      // console.log(nowParam)
      nowParam.attr_vals.splice(index, 1)
      const attrVals = nowParam.attr_vals.join(' ')
      const { data: res } = await this.$http.put(
        'categories/' + nowParam.cat_id + '/attributes/' + nowParam.attr_id,
        {
          attr_name: nowParam.attr_name,
          attr_sel: nowParam.attr_sel,
          attr_vals: attrVals
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
    },
    // 显示参数可选项 输入框
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 添加参数可选项 输入框失去焦点或者敲回车提交
    async handleInputConfirm(nowParam) {
      if (this.inputValue.trim()) {
        nowParam.attr_vals.push(this.inputValue.trim())
        const attrVals = nowParam.attr_vals.join(' ')
        const { data: res } = await this.$http.put(
          'categories/' + nowParam.cat_id + '/attributes/' + nowParam.attr_id,
          {
            attr_name: nowParam.attr_name,
            attr_sel: nowParam.attr_sel,
            attr_vals: attrVals
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
      }
      this.inputVisible = false
      this.inputValue = ''
    },

    // Tab 动态静态参数切换
    handleClick() {
      if (this.catThreeId === 0) {
        return null
      }
      this.getParamInfos()
    },
    // 级联选择器内容改变
    handleChange() {
      if (this.selectedCat.length !== 3) {
        this.selectedCat = []
        this.catThreeId = 0
        this.showButton = true
        this.manyParamInfos = []
        this.onlyParamInfos = []
      } else {
        this.showButton = false
        this.catThreeId = this.selectedCat[2]
        this.getParamInfos()
      }
    },
    // 获取参数信息
    async getParamInfos() {
      const { data: res } = await this.$http.get(
        `categories/${this.catThreeId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
      if (this.activeName === 'many') {
        this.manyParamInfos = res.data
      } else {
        this.onlyParamInfos = res.data
      }
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
      // 编辑参数
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '此处不能为空', trigger: 'blur' }
        ]
      },
      // 添加参数
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '此处不能为空', trigger: 'blur' }
        ]
      },
      // 获取分类数据
      catInfos: [],
      catInfosProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCat: [],
      activeName: 'many',
      showButton: true,
      // 动态参数数据
      manyParamInfos: [],
      // 静态属性数据
      onlyParamInfos: [],
      // 第三级分类id
      catThreeId: 0,

      // 参数 tag标签 可选项
      // 按钮和输入框
      inputVisible: false,
      inputValue: ''
    }
  },
  created() {
    this.getCatInfos()
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin-top: 15px;
}
.el-tag {
  margin: 10px 5px;
}

.input-new-tag {
  width: 100px;
}
</style>
