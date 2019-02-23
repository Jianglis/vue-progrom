<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-button type="primary" @click="showAddDialog">添加分类</el-button>
      <zk-table
        :data="catInfos"
        :columns="catInfosColumns"
        :expand-type="false"
        :selection-type="false"
        show-index
      >
        <template slot="deleted" slot-scope="info">
          <i
            class="el-icon-circle-check"
            style="color:rgb(68, 178, 170)"
            v-if="info.row.cat_deleted == false"
          ></i>
          <i class="el-icon-circle-close" style="color:red;" v-else></i>
        </template>
        <template slot="order" slot-scope="info">
          <el-tag v-if="info.row.cat_level== 0" disable-transitions>一级</el-tag>
          <el-tag v-else-if="info.row.cat_level== 1" type="success" disable-transitions>二级</el-tag>
          <el-tag v-else type="warning" disable-transitions>三级</el-tag>
        </template>
        <template slot="handle" slot-scope="info">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditDialog(info.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="delCate(info.row.cat_id)"
          >删除</el-button>
        </template>
      </zk-table>

      <!-- 分页 -->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-size="queryParams.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="totalNum"
      ></el-pagination>

      <!-- 添加分类对话框 -->
      <el-dialog title="添加分类" :visible.sync="addFormVisible" width="50%" @close="closeAddDialog">
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          @keyup.enter.native="addCat"
        >
          <el-form-item label="分类名称" prop="cat_name" label-width="80px">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="分类上级" label-width="80px">
            <el-cascader
              expand-trigger="hover"
              :options="catLists"
              :props="catListsProps"
              v-model="selectedCat"
              @change="catChange"
              change-on-select
              clearable
              style="width:100%"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCat">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 编辑对话框 -->
      <el-dialog title="修改分类" :visible.sync="editFormVisible" width="50%" @close="closeEditDialog">
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          @keyup.enter.native="editCat"
        >
          <el-form-item label="分类名称" prop="cat_name" label-width="80px">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCat">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  methods: {
    // 添加分类
    // 显示添加对话框
    async showAddDialog() {
      this.addFormVisible = true
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // console.log(res)
      this.catLists = res.data
    },
    // 关闭添加对话框
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
      // 清除之前选中的信息
      this.selectedCat = []
      // 或者清除之前记录的选中信息
      // this.addForm.cat_pid = 0
      // this.addForm.cat_level = 0
    },
    // 绑定值发生变化
    catChange(v) {
      // console.log(v)
      const len = this.selectedCat.length
      if (len === 0) {
        // 添加一级分类
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      } else {
        // 添加二级三级分类
        this.addForm.cat_pid = this.selectedCat[len - 1]
        this.addForm.cat_level = len
      }
    },
    // 提交添加内容
    addCat() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(
            'categories',
            this.addForm
          )
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.addFormVisible = false
          this.$message.success(res.meta.msg)
          this.getCatInfos()
        }
      })
    },
    // 编辑分类
    // 显示编辑对话框
    async showEditDialog(id) {
      this.editFormVisible = true
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
    },
    // 关闭编辑对话框
    closeEditDialog() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交修改内容
    editCat() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'categories/' + this.editForm.cat_id,
            this.editForm
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.editFormVisible = false
          this.$message.success(res.meta.msg)
          this.getCatInfos()
        }
      })
    },
    // 删除分类
    delCate(id) {
      this.$confirm('确定删除该分类吗?', '删除分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete('categories/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          if (this.catInfos.length === 1 && this.queryParams.pagenum > 1) {
            this.queryParams.pagenum--
          }
          this.getCatInfos()
        })
        .catch(() => {})
    },
    // 获取分类列表
    async getCatInfos() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.catInfos = res.data.result
      this.totalNum = res.data.total
    },
    // 分页相关
    handleCurrentChange(val) {
      this.queryParams.pagenum = val
      this.getCatInfos()
    }
  },
  data() {
    return {
      catInfos: [],
      catInfosColumns: [
        { label: '分类名称', prop: 'cat_name', width: '200px' },
        { label: '是否有效', type: 'template', template: 'deleted' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'handle' }
      ],
      // 获取分类列表时的请求参数
      queryParams: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      totalNum: 0,
      // 编辑分类相关
      editFormVisible: false,
      editForm: {
        cat_name: ''
      },
      editFormRules: {
        cat_name: [{ required: true, message: '该项不能为空', trigger: 'blur' }]
      },
      // 添加分类相关
      addFormVisible: false,
      addForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addFormRules: {
        cat_name: [{ required: true, message: '该项不能为空', trigger: 'blur' }]
      },
      catLists: [],
      catListsProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCat: []
    }
  },
  created() {
    this.getCatInfos()
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
}
</style>
