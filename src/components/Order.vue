<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row>
        <el-input
          placeholder="请输入搜索内容"
          clearable
          @clear="getOrderInfos"
          v-model="queryParams.query"
          style="width:350px"
        >
        <!-- 搜索内容有问题 -->
          <el-button slot="append" icon="el-icon-search" @click="getOrderInfos"></el-button>
        </el-input>
      </el-row>

      <!-- 订单列表 -->
      <el-table :data="orderLists" border style="width: 100%">
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="90">
          <template slot-scope="info">
            <el-tag type="success" v-if="info.row.pay_status===1" :disable-transitions="true">已付款</el-tag>
            <el-tag type="danger" v-else :disable-transitions="true">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="90"></el-table-column>
        <el-table-column label="下单时间" width="140">
          <template slot-scope="info">
            <span>{{ info.row.create_time| dateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template slot-scope="info">
            <el-button type="primary" icon="el-icon-edit" size="mini" title="修改订单"></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              title="查看物流"
              @click="showAddressDialog(info.row.order_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalNum"
      ></el-pagination>

      <!-- 编辑对话框 -->
      <el-dialog title="物流信息" :visible.sync="addressFormVisible" width="50%"></el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  methods: {
    // 显示物流信息对话框
    showAddressDialog() {
      this.addressFormVisible = true
    },
    // 分页
    handleSizeChange(val) {
      this.queryParams.pagesize = val
      this.getOrderInfos()
    },
    handleCurrentChange(val) {
      this.queryParams.pagenum = val
      this.getOrderInfos()
    },
    // 获取订单列表数据
    async getOrderInfos() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.orderLists = res.data.goods
      this.totalNum = res.data.total
    }
  },
  data() {
    return {
      // 获取订单列表的参数
      queryParams: {
        query: '',
        pagesize: 5,
        pagenum: 1
      },
      totalNum: 0,
      orderLists: [],
      addressFormVisible: false
    }
  },
  created() {
    this.getOrderInfos()
  }
}
</script>

<style lang="less" scoped>
</style>
