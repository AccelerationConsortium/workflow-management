# GitHub Actions 部署修复

## 问题描述
主分支的 GitHub Actions workflow 使用了过时的 AWS CLI 安装方式：
```bash
sudo apt-get install -y awscli
```

这导致错误：`E: Package 'awscli' has no installation candidate`

## 解决方案

### 方法 1: 使用官方 AWS Actions (推荐)
替换旧的手动安装方式，使用官方的 AWS GitHub Actions：

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Deploy to S3
  run: |
    aws s3 sync dist s3://${{ vars.S3_BUCKET_NAME }} --delete
```

### 方法 2: 使用官方 AWS CLI 安装脚本
如果需要手动安装 AWS CLI：

```yaml
- name: Install AWS CLI
  run: |
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
```

### 方法 3: 使用预装的 AWS CLI
GitHub Actions runner 已经预装了 AWS CLI v2，可以直接使用：

```yaml
- name: Configure AWS credentials
  run: |
    aws configure set aws_access_key_id ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws configure set aws_secret_access_key ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws configure set default.region us-east-1
```

## 必要的环境变量设置

在 GitHub 仓库中设置以下 Secrets 和 Variables：

### Secrets (Settings → Secrets and variables → Actions → Secrets)
- `AWS_ACCESS_KEY_ID` - AWS 访问密钥 ID
- `AWS_SECRET_ACCESS_KEY` - AWS 秘密访问密钥

### Variables (Settings → Secrets and variables → Actions → Variables)  
- `S3_BUCKET_NAME` - S3 存储桶名称
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront 分发 ID

## 修复步骤

1. 打开 `.github/workflows/deploy.yml`
2. 删除旧的 AWS CLI 安装步骤
3. 使用上面推荐的方法 1
4. 确保环境变量已正确设置
5. 提交并推送修改

## 测试部署

修复后可以通过以下方式测试：
- 推送到 main 分支触发自动部署
- 或在 Actions 页面手动触发 workflow

## 完整的修复后 workflow 示例

参考 `deploy.yml` 文件中的最新版本，它已经使用了正确的 AWS 集成方式。