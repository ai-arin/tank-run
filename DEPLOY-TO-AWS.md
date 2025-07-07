# 🚀 Deploy Tank Run to AWS S3 Static Website

This guide will help you deploy your Tank Run game as a static website on Amazon S3.

## 📋 Prerequisites

- AWS Account (free tier eligible)
- AWS CLI installed (optional but recommended)
- Your Tank Run game files ready

## 🎯 Deployment Steps

### Step 1: Create S3 Bucket

1. **Log into AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Navigate to **S3** service

2. **Create New Bucket**
   - Click **"Create bucket"**
   - **Bucket name**: `tank-run-game-[your-unique-id]` (must be globally unique)
   - **Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Uncheck "Block all public access"** ⚠️ Important!
   - Check the acknowledgment box
   - Click **"Create bucket"**

### Step 2: Upload Game Files

1. **Select Your Bucket**
   - Click on your newly created bucket

2. **Upload Files**
   - Click **"Upload"**
   - **Add files**: Select `index.html`
   - **Add folder**: Select the `js` folder
   - **Add files**: Select `README.md`, `HOW-TO-PLAY.md` (optional)
   - Click **"Upload"**

### Step 3: Configure Static Website Hosting

1. **Go to Properties Tab**
   - In your bucket, click **"Properties"**

2. **Enable Static Website Hosting**
   - Scroll to **"Static website hosting"**
   - Click **"Edit"**
   - Select **"Enable"**
   - **Index document**: `index.html`
   - **Error document**: `index.html` (optional)
   - Click **"Save changes"**

3. **Note the Website URL**
   - Copy the **Bucket website endpoint** URL
   - Format: `http://tank-run-game-[your-id].s3-website-[region].amazonaws.com`

### Step 4: Set Bucket Policy for Public Access

1. **Go to Permissions Tab**
   - Click **"Permissions"**

2. **Add Bucket Policy**
   - Click **"Bucket policy"**
   - Paste this policy (replace `YOUR-BUCKET-NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

3. **Save Policy**
   - Click **"Save changes"**

## 🌐 Alternative: Using AWS CLI

If you have AWS CLI installed and configured:

### Install AWS CLI
```bash
# macOS
brew install awscli

# Or download from AWS
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### Configure AWS CLI
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter your region (e.g., us-east-1)
# Enter output format (json)
```

### Deploy with CLI Commands
```bash
# 1. Create bucket
aws s3 mb s3://tank-run-game-unique-name --region us-east-1

# 2. Upload files
aws s3 sync . s3://tank-run-game-unique-name --exclude "*.md" --exclude ".git/*"

# 3. Enable website hosting
aws s3 website s3://tank-run-game-unique-name --index-document index.html

# 4. Set public read policy
aws s3api put-bucket-policy --bucket tank-run-game-unique-name --policy file://bucket-policy.json
```

### Create bucket-policy.json file:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::tank-run-game-unique-name/*"
        }
    ]
}
```

## 🔧 File Optimization for Web

### 1. Update Cache-Busting
Update your `index.html` to remove version parameters for production:

```html
<!-- Change from: -->
<script src="js/game.js?v=1.1"></script>

<!-- To: -->
<script src="js/game.js"></script>
```

### 2. Add Meta Tags for SEO
Add to your `<head>` section:

```html
<meta name="description" content="Tank Run - Retro style tank combat game. Survive 20 levels of intense combat!">
<meta name="keywords" content="tank game, retro game, combat, HTML5 game">
<meta name="author" content="Your Name">
<meta property="og:title" content="Tank Run - Retro Tank Combat Game">
<meta property="og:description" content="Survive 20 levels of intense tank combat in this retro-style game!">
<meta property="og:type" content="website">
```

### 3. Add Favicon (Optional)
Create a simple favicon and add to `<head>`:

```html
<link rel="icon" type="image/x-icon" href="favicon.ico">
```

## 🎯 Custom Domain (Optional)

### Using Route 53
1. **Register Domain** in Route 53
2. **Create Hosted Zone**
3. **Add CNAME Record** pointing to S3 website endpoint
4. **Update Bucket Name** to match domain

### Using CloudFront (Recommended)
1. **Create CloudFront Distribution**
2. **Origin**: Your S3 bucket website endpoint
3. **Enable HTTPS**
4. **Custom Domain**: Your domain name
5. **SSL Certificate**: Request from ACM

## 📊 Monitoring and Analytics

### CloudWatch Metrics
- Monitor S3 requests
- Track data transfer
- Set up billing alerts

### Google Analytics (Optional)
Add to your `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 💰 Cost Estimation

### S3 Costs (Free Tier)
- **Storage**: First 5 GB free
- **Requests**: 20,000 GET requests free
- **Data Transfer**: 15 GB out free

### Typical Monthly Cost
- **Small game** (~10 MB): $0.01 - $0.50/month
- **With moderate traffic**: $1 - $5/month
- **High traffic**: $10 - $50/month

## 🔒 Security Best Practices

### 1. Bucket Security
- Only allow public read access
- Never make bucket fully public
- Use bucket policies, not ACLs

### 2. Content Security
- No sensitive data in client-side code
- Use HTTPS (via CloudFront)
- Implement CSP headers

### 3. Access Control
- Use IAM roles for deployment
- Rotate access keys regularly
- Monitor access logs

## 🚀 Deployment Checklist

- [ ] Create S3 bucket with unique name
- [ ] Upload all game files
- [ ] Enable static website hosting
- [ ] Set bucket policy for public read
- [ ] Test website URL
- [ ] Remove cache-busting parameters
- [ ] Add meta tags for SEO
- [ ] Set up custom domain (optional)
- [ ] Configure CloudFront (optional)
- [ ] Add analytics (optional)

## 🎮 Post-Deployment

### Test Your Game
1. **Visit your S3 website URL**
2. **Test all game features**:
   - Game starts properly
   - Controls work (WASD, B, N keys)
   - TNT system functions
   - Audio plays correctly
   - Leaderboard saves scores
3. **Test on different devices**:
   - Desktop browsers
   - Mobile devices
   - Different screen sizes

### Share Your Game
- **Social Media**: Share the URL
- **Gaming Communities**: Post on Reddit, Discord
- **Portfolio**: Add to your developer portfolio
- **Friends & Family**: Get feedback

## 🔄 Updates and Maintenance

### Updating Your Game
1. **Make changes locally**
2. **Test thoroughly**
3. **Upload changed files to S3**
4. **Clear browser cache** for testing

### Monitoring
- **Check S3 metrics** monthly
- **Monitor costs** in billing dashboard
- **Review access logs** for usage patterns

---

## 🎯 Quick Start Commands

If you have AWS CLI configured:

```bash
# Create and deploy in one go
BUCKET_NAME="tank-run-game-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME
aws s3 sync . s3://$BUCKET_NAME --exclude "*.md" --exclude ".git/*"
aws s3 website s3://$BUCKET_NAME --index-document index.html
echo "Your game is live at: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
```

**Your Tank Run game will be live and playable worldwide! 🌍🎮**
