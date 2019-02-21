<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-button type="primary">添加分类</el-button>
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
        <template slot="handle">
          <el-button type="primary" size="mini">
            <i class="el-icon-edit"></i>
            编辑
          </el-button>
          <el-button type="danger" size="mini">
            <i class="el-icon-delete"></i>删除
          </el-button>
        </template>
      </zk-table>
    </el-card>
  </div>
</template>

<script>
export default {
  methods: {
    // 获取分类列表
    async getCatInfos() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryCdt
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.catInfos = res.data.result
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
      queryCdt: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      }
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
