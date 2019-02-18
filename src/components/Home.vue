<template>
  <el-container>
    <el-header>
      <div class="logo-box">
        <img src="../assets/img/heima.png">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="menuShow ? '65px' :'200px'">
        <div class="toggle-bar" @click="menuShow = !menuShow">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="menuShow"
          :collapse-transition="false"
          :unique-opened="true"
          :router="true"
        >
          <el-submenu
            :index="item.id + ''"
            v-for="(item, i) in menuList"
            :key="item.id"
            :style="{width: menuShow ? '65px' :'200px'}"
          >
            <template slot="title">
              <i :class="'iconfont icon-' + menuIcon[i]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="item2.path" v-for="item2 in item.children" :key="item2.id">
              <i class="el-icon-menu"></i>
              <span>{{item2.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    this.getMenu()
  },
  data() {
    return {
      menuShow: false,
      menuList: [],
      menuIcon: ['users', 'tijikongjian', 'shangpin', 'danju', 'baobiao']
    }
  },
  methods: {
    logout() {
      this.$confirm('确定要退出吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          window.sessionStorage.removeItem('token')
          this.$router.push('/login')
          this.$message({
            type: 'success',
            message: '退出成功!'
          })
        })
        .catch(() => {})
    },
    async getMenu() {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
  .el-header {
    background-color: #373d41;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    padding-right: 20px;
    user-select: none;
    .logo-box {
      display: flex;
      align-items: center;
      color: #fff;
      font-size: 22px;
      img {
        width: 50px;
        height: 50px;
        margin-right: 10px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .toggle-bar {
      height: 25px;
      font-size: 12px;
      text-align: center;
      line-height: 25px;
      letter-spacing: 0.1em;
      color: #fff;
      background-color: #4a5064;
      cursor: pointer;
      user-select: none;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>
