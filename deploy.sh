#!/bin/bash

# 🚀 Tank Run - AWS S3 Deployment Script
# This script deploys your Tank Run game to AWS S3 as a static website

set -e  # Exit on any error

# Configuration
BUCKET_NAME="game-tank-run"
REGION="us-east-1"

echo "🎮 Tank Run - AWS S3 Deployment"
echo "================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed!"
    echo "Please install AWS CLI first:"
    echo "  macOS: brew install awscli"
    echo "  Or visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured!"
    echo "Please run: aws configure"
    echo "You'll need your AWS Access Key ID and Secret Access Key"
    exit 1
fi

echo "✅ AWS CLI is installed and configured"
echo ""

# Check if bucket exists, create if it doesn't
echo "🪣 Checking S3 bucket: $BUCKET_NAME"
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "✅ Bucket $BUCKET_NAME already exists, reusing it"
else
    echo "📦 Creating new S3 bucket: $BUCKET_NAME"
    aws s3 mb s3://$BUCKET_NAME --region $REGION
    
    if [ $? -eq 0 ]; then
        echo "✅ Bucket created successfully"
    else
        echo "❌ Failed to create bucket"
        exit 1
    fi
fi

echo ""

# Upload game files (HTML, JS, CSS)
echo "📤 Uploading game files..."
aws s3 sync . s3://$BUCKET_NAME \
    --include "*.html" \
    --include "*.css" \
    --include "js/*" \
    --include "*.md" \
    --exclude "*" \
    --delete

if [ $? -eq 0 ]; then
    echo "✅ Core game files uploaded successfully"
else
    echo "❌ Failed to upload core game files"
    exit 1
fi

# Upload assets (images, audio, etc.)
echo "📸 Uploading assets..."
if [ -d "assets" ]; then
    aws s3 sync assets/ s3://$BUCKET_NAME/assets/ \
        --delete
    
    if [ $? -eq 0 ]; then
        echo "✅ Assets uploaded successfully"
    else
        echo "❌ Failed to upload assets"
        exit 1
    fi
else
    echo "ℹ️  No assets folder found, skipping asset upload"
fi

# Set proper content types for images
echo "🖼️  Setting content types for images..."
if [ -d "assets/images" ]; then
    # Set content type for common image formats
    aws s3 cp s3://$BUCKET_NAME/assets/images/ s3://$BUCKET_NAME/assets/images/ \
        --recursive \
        --metadata-directive REPLACE \
        --content-type "image/png" \
        --exclude "*" \
        --include "*.png" || true
    
    aws s3 cp s3://$BUCKET_NAME/assets/images/ s3://$BUCKET_NAME/assets/images/ \
        --recursive \
        --metadata-directive REPLACE \
        --content-type "image/jpeg" \
        --exclude "*" \
        --include "*.jpg" || true
    
    aws s3 cp s3://$BUCKET_NAME/assets/images/ s3://$BUCKET_NAME/assets/images/ \
        --recursive \
        --metadata-directive REPLACE \
        --content-type "image/jpeg" \
        --exclude "*" \
        --include "*.jpeg" || true
    
    aws s3 cp s3://$BUCKET_NAME/assets/images/ s3://$BUCKET_NAME/assets/images/ \
        --recursive \
        --metadata-directive REPLACE \
        --content-type "image/gif" \
        --exclude "*" \
        --include "*.gif" || true
    
    echo "✅ Image content types configured"
fi

echo ""

# Enable static website hosting
echo "🌐 Enabling static website hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

if [ $? -eq 0 ]; then
    echo "✅ Static website hosting enabled"
else
    echo "❌ Failed to enable static website hosting"
    exit 1
fi

echo ""

# Create bucket policy for public read access
echo "🔓 Setting up public read access..."
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

if [ $? -eq 0 ]; then
    echo "✅ Public read access configured"
else
    echo "❌ Failed to set bucket policy"
    exit 1
fi

# Clean up temporary file
rm /tmp/bucket-policy.json

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "🌐 Your Tank Run game is now live at:"
echo "   http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "📊 AWS Console Links:"
echo "   S3 Bucket: https://console.aws.amazon.com/s3/buckets/$BUCKET_NAME"
echo "   CloudWatch: https://console.aws.amazon.com/cloudwatch/"
echo ""
echo "💡 Next Steps:"
echo "   1. Test your game at the URL above"
echo "   2. Check your images at: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com/assets/images/"
echo "   3. Share the link with friends!"
echo "   4. Consider setting up a custom domain"
echo "   5. Monitor usage in AWS Console"
echo ""
echo "💰 Estimated monthly cost: $0.01 - $5.00 (depending on traffic)"
echo ""
echo "🎮 Happy Gaming!"
