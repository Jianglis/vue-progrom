<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            v-model="queryParams.query"
            @keyup.enter.native="getUserInfos"
            @keyup.esc.native="clearQuery"
            :clearable="true"
            @clear="getUserInfos"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserInfos"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addFormVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userLists" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机号码" width="120"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="160"></el-table-column>
        <el-table-column prop="mg_state" label="状态" width="60">
          <el-switch
            v-model="info.row.mg_state"
            slot-scope="info"
            @change="changeState(info.row.id,info.row.mg_state)"
          ></el-switch>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(info.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUser(info.row.id)"
            ></el-button>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="assignRoleDialog(info.row.id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
      ></el-pagination>

      <el-dialog title="添加用户" :visible.sync="addFormVisible" width="50%" @close="closeAddDialog">
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          @keyup.enter.native="addUser"
        >
          <el-form-item label="用户名" prop="username" label-width="80px">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" label-width="80px">
            <el-input v-model="addForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email" label-width="80px">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile" label-width="80px">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="编辑用户" :visible.sync="editFormVisible" width="50%" @close="closeEditDialog">
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          @keyup.enter.native="editUser"
        >
          <el-form-item label="用户名" prop="username" label-width="80px">
            <el-input v-model="editForm.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email" label-width="80px">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile" label-width="80px">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog
        title="用户分配角色"
        :visible.sync="assignFormVisible"
        width="50%"
        @close="closeAssignDialog"
      >
        <el-form
          ref="assignFormRef"
          :model="assignForm"
          :rules="assignFormRules"
          @keyup.enter.native="assignUser"
        >
          <el-form-item label="当前用户" label-width="120px">{{assignForm.username}}</el-form-item>
          <el-form-item label="分配的新角色" label-width="120px" prop="rid">
            <el-select v-model="assignForm.rid" placeholder="请选择">
              <el-option
                v-for="item in roleInfos"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="assignFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="assignUser">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserInfos()
  },
  methods: {
    // 分配角色
    // 显示弹框
    async assignRoleDialog(id) {
      this.assignFormVisible = true
      // 获取当前角色信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.assignForm = res.data

      // 超级管理员rid为0, 默认选项placeholder
      if (this.assignForm.rid === 0) {
        this.assignForm.rid = ''
      }

      // 获取角色列表
      const { data: res2 } = await this.$http.get('roles')
      if (res2.meta.status !== 200) {
        return this.$message.error(res2.meta.msg)
      }
      this.roleInfos = res2.data
    },
    // 关闭弹框,重置表单
    closeAssignDialog() {
      this.$refs.assignFormRef.resetFields()
    },
    // 分配角色提交数据
    assignUser() {
      this.$refs.assignFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.assignForm.id + '/role',
            this.assignForm
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.assignFormVisible = false
          this.$message.success(res.meta.msg)
          this.getUserInfos()
        }
      })
    },
    // 修改用户
    closeEditDialog() {
      this.$refs.editFormRef.resetFields()
    },
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.editForm.id,
            this.editForm
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.editFormVisible = false
          this.$message.success(res.meta.msg)
          this.getUserInfos()
        }
      })
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      this.editFormVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
    },

    // 删除用户
    delUser(id) {
      this.$confirm('确定删除该用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          // 当前页码只有1条数据时，删除后重新加载到前一页，除首页外
          if (this.queryParams.pagenum && this.userLists.length === 1) {
            this.queryParams.pagenum--
          }
          this.$message.success(res.meta.msg)
          this.getUserInfos()
        })
        .catch(() => {})
    },
    // 重置添加用户对话框
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
    },
    // 提交添加用户表单
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.addFormVisible = false
          this.$message.success(res.meta.msg)
          this.getUserInfos()
        }
      })
    },
    // 修改用户状态
    async changeState(uId, state) {
      // console.log(uId, state)
      const { data: res } = await this.$http.put(`users/${uId}/state/${state}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 清除查询
    clearQuery() {
      this.queryParams.query = ''
      this.getUserInfos()
    },
    // 分页相关
    handleSizeChange(val) {
      // console.log(val)
      this.queryParams.pagesize = val
      this.getUserInfos()
    },
    handleCurrentChange(val) {
      // console.log(val)
      this.queryParams.pagenum = val
      this.getUserInfos()
    },
    // 获取用户列表信息
    async getUserInfos() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryParams
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.userLists = res.data.users
      this.totalUsers = res.data.total
    }
  },
  data() {
    // 自定义手机号码验证器
    var checkMoblie = (rule, value, callback) => {
      if (!/^1[3578]\d{9}$/.test(value)) {
        return callback(new Error('手机号码格式错误'))
      }
      callback()
    }
    // var checkEmail = (rule, value, callback) => {
    //   if (!/^\w+@\w+\.[a-z]{2,3}$/.test(value)) {
    //     return callback(new Error('邮箱格式错误'))
    //   }
    //   callback()
    // }
    return {
      // 用户列表相关数据
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      totalUsers: 0,
      userLists: [],

      // 添加用户相关数据
      addFormVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mpbile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '用户名必填', trigger: 'blur' },
          {
            min: 2,
            max: 8,
            message: '用户名长度要求: 2 到 8 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '密码必填', trigger: 'blur' },
          { min: 6, message: '密码不得少于6位', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号码必填', trigger: 'blur' },
          { validator: checkMoblie, trigger: 'blur' }
        ]
        // email: [{ validator: checkEmail, trigger: 'blur' }]
      },

      // 编辑用户相关数据
      editFormVisible: false,
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      editFormRules: {
        mobile: [
          { required: true, message: '手机号码必填', trigger: 'blur' },
          { validator: checkMoblie, trigger: 'blur' }
        ]
        // email: [{ validator: checkEmail, trigger: 'blur' }]
      },

      // 分配角色相关数据
      assignFormVisible: false,
      assignForm: {
        id: '',
        username: '',
        rid: ''
      },
      roleInfos: [],
      assignFormRules: {
        rid: [{required: true, message: '此为必选项', trigger: 'change'}]
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
