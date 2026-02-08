# MongoDB Visualization Data Cleaning

一个基于 Next.js 的食物数据管理后台，支持筛选、搜索、分页、详情查看与编辑。

## 功能概览
- 食物卡片列表与图片展示
- 分类筛选、搜索与分页
- 详情弹窗查看与编辑（需编辑令牌）
- 卡片缩放与文字缩放调节

## 技术栈
- Next.js 14
- React 18
- MongoDB

## 环境变量
在项目根目录创建 `.env.local`，并配置以下变量：

```
MONGODB_URI=your_mongodb_uri
MONGODB_URI_ADMIN=your_mongodb_uri_admin
MONGODB_DB=your_database_name
MONGODB_COLLECTION=foods
MONGODB_EDIT_TOKEN=your_edit_token
```

提示：

1. `MONGODB_URI`：普通用户连接 URI，用于读取数据。需要手动新建只读权限的用户，格式参考下面的示例。
2. `MONGODB_URI_ADMIN`：管理员连接 URI，用于写入数据。新建MongoDB Atlas Cluster时，会自动生成一个ADMIN URI，格式为 `mongodb+srv://<username>:<password>@<cluster-address>/admin?retryWrites=true&w=majority`。
3. `MONGODB_DB`：数据库项目名称。
4. `MONGODB_COLLECTION`：Cluster名称，默认 `foods`。
5. `MONGODB_EDIT_TOKEN`：编辑令牌，用于在详情弹窗中验证编辑权限。你可以自行设置，建议使用16以上位随机字符。

## 本地开发
```
npm install
npm run dev
```

开发服务默认运行在 http://localhost:3000

## 常用脚本
```
npm run dev
npm run build
npm run start
npm run lint
```

## 部署到 Vercel
- 将代码推送到 GitHub
- 在 Vercel 导入仓库
- 在项目设置中配置与本地一致的环境变量
- 一键部署
