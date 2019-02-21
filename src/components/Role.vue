<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
      <el-table :data="rolesLists" border stripe style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="info">
            <el-row
              v-for="(item,k) in info.row.children"
              :key="item.id"
              :style="{'border-bottom': '1px solid rgb(235, 238, 245)','border-top': k == 0 ? '1px solid rgb(235, 238, 245)':''}"
            >
              <el-col :span="5">
                <el-tag
                  closable
                  :disable-transitions="true"
                  @close="delRoleRights(info.row.id,item.id)"
                >{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2,k2) in item.children"
                  :key="item2.id"
                  :style="{'border-top': k2 != 0 ? '1px solid rgb(235, 238, 245)':''}"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      :disable-transitions="true"
                      type="success"
                      @close="delRoleRights(info.row.id,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      :disable-transitions="true"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      @close="delRoleRights(info.row.id,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogShow(info.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delRole(info.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightsDialog(info.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色弹框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色弹框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限弹框 -->
    <el-dialog title="角色分配" :visible.sync="setRightsDialogVisible" width="50%">
      <el-form :model="setRightsForm" label-width="80px">
        <el-form-item label="当前角色: ">
         {{ setRightsForm.roleName }}
        </el-form-item>
        <el-form-item label="角色权限: ">
          <el-tree
          :data="roleRightsLists"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defaultCheckedKeys"
          :props="roleRightsProps"
          ref="TreeRef"
        ></el-tree>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  methods: {
    // 删除角色指定权限
    // 也可以点击删除按钮传入info.row参数相当于role的信息,获取roleId为 role.id,重新加载数据时为role.children = res.data
    delRoleRights(roleId, rightsId) {
      this.$confirm('确定删除该权限吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete(
            `roles/${roleId}/rights/${rightsId}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          this.getRolesInfos()
        })
        .catch(() => {})
    },

    // 分配权限相关
    // 显示树状权限列表
    async showSetRightsDialog(role) {
      this.setRightsDialogVisible = true
      this.setRightsForm = role
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleRightsLists = res.data
      const keys = []
      this.getLeafIds(role, keys)
      this.defaultCheckedKeys = keys
    },

    // 提交分配的权限
    async setRights() {
      const k1 = this.$refs.TreeRef.getCheckedKeys()
      const k2 = this.$refs.TreeRef.getHalfCheckedKeys()
      // console.log(k1, k2)
      const idsStr = [...k1, ...k2].join()
      const { data: res } = await this.$http.post(
        'roles/' + this.setRightsForm.id + '/rights',
        { rids: idsStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.setRightsDialogVisible = false
      this.$message.success(res.meta.msg)
      this.getRolesInfos()
    },

    // 通过给定的获取全部三级权限ids数组
    getLeafIds(rights, ids) {
      if (!rights.children) {
        return ids.push(rights.id)
      }
      rights.children.forEach(item => this.getLeafIds(item, ids))
    },

    // 删除角色相关
    delRole(id) {
      // 确认
      this.$confirm('确定删除该角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          this.getRolesInfos()
        })
        .catch(() => {})
    },

    // 修改角色相关
    // 关闭弹框,重置表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 显示修改角色弹框
    async editDialogShow(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
    },
    // 提交数据
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'roles/' + this.editForm.roleId,
            this.editForm
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.editDialogVisible = false
          this.$message({
            type: 'success',
            message: '角色修改成功',
            duration: 2000
          })
          this.getRolesInfos()
        }
      })
    },

    // 添加角色相关
    // 提交数据
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('roles', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.addDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getRolesInfos()
        }
      })
    },
    // 关闭添加角色弹框,重置表单
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 获取角色列表
    async getRolesInfos() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rolesLists = res.data
    }
  },
  data() {
    return {
      rolesLists: [],
      // 添加角色相关数据
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },

      // 修改角色相关数据
      editDialogVisible: false,
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },

      // 分配权限相关
      setRightsDialogVisible: false,
      // 角色权限列表
      roleRightsLists: [],
      // 默认选中的权限
      defaultCheckedKeys: [],
      // 要操作的角色
      setRightsForm: {
        id: 0,
        roleName: ''
      },
      // 树状权限列表配置选项
      roleRightsProps: {
        label: 'authName',
        children: 'children'
      }
    }
  },
  created() {
    this.getRolesInfos()
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px 5px;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>
