<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            clearable
            @clear="getGoodsInfos"
            v-model="queryParams.query"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsInfos"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表 -->
      <el-table :data="goodsLists" border style="width: 100%">
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="90"></el-table-column>
        <el-table-column label="创建时间" width="140">
          <template slot-scope="info">
            <span>{{ info.row.add_time| dateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delGoods(info.row.goods_id)"
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
    </el-card>
  </div>
</template>

<script>
export default {
  methods: {
    // 跳转至添加商品
    addGoods() {
      this.$router.push('/goodsadd')
    },
    // 删除商品
    delGoods(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete('goods/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          // 当前页码只有1条数据时，删除后重新加载到前一页，除首页外
          if (this.queryParams.pagenum > 1 && this.goodsLists.length === 1) {
            this.queryParams.pagenum--
          }
          this.$message({
            type: 'success',
            message: res.meta.msg,
            duration: 2000
          })
          this.getGoodsInfos()
        })
        .catch(() => {})
    },
    // 分页
    handleSizeChange(val) {
      this.queryParams.pagesize = val
      this.getGoodsInfos()
    },
    handleCurrentChange(val) {
      this.queryParams.pagenum = val
      this.getGoodsInfos()
    },
    // 获取商品列表数据
    async getGoodsInfos() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // console.log(res)
      this.goodsLists = res.data.goods
      this.totalNum = res.data.total
    }
  },
  data() {
    return {
      addGoodsVisible: false,
      goodsLists: [],
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      totalNum: 0
    }
  },
  created() {
    this.getGoodsInfos()
  }
}
</script>

<style lang="less" scoped>
</style>
