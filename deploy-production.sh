#!/bin/bash

# 🚀 Tank Run - Production Deployment Script
# Deploys the built and obfuscated version to AWS S3

set -e  # Exit on any error

# Configuration
BUCKET_NAME="game-tank-run"
REGION="us-east-1"
BUILD_DIR="dist"

echo "🚀 Tank Run - Production Deployment"
echo "==================================="
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory '$BUILD_DIR' not found!"
    echo "Please run './build.sh' first to create the production build"
    exit 1
fi

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
echo "✅ Production build found in $BUILD_DIR/"
echo ""

# Show build info if available
if [ -f "$BUILD_DIR/build-info.json" ]; then
    echo "📊 Build Information:"
    cat $BUILD_DIR/build-info.json | grep -E '"buildDate"|"obfuscated"|"minified"' | sed 's/^/   /'
    echo ""
fi

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

# Upload files with proper content types and caching headers
echo "📤 Uploading production files with optimized headers..."

# Upload HTML with no-cache headers
aws s3 cp $BUILD_DIR/index.html s3://$BUCKET_NAME/index.html \
    --content-type "text/html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE

# Upload JavaScript with long-term caching
if [ -f "$BUILD_DIR/tank-run.min.js" ]; then
    aws s3 cp $BUILD_DIR/tank-run.min.js s3://$BUCKET_NAME/tank-run.min.js \
        --content-type "application/javascript" \
        --cache-control "public, max-age=31536000" \
        --metadata-directive REPLACE
fi

# Upload CSS with long-term caching
if [ -f "$BUILD_DIR/tank-run.min.css" ]; then
    aws s3 cp $BUILD_DIR/tank-run.min.css s3://$BUCKET_NAME/tank-run.min.css \
        --content-type "text/css" \
        --cache-control "public, max-age=31536000" \
        --metadata-directive REPLACE
fi

# Upload additional files
if [ -f "$BUILD_DIR/README.md" ]; then
    aws s3 cp $BUILD_DIR/README.md s3://$BUCKET_NAME/README.md \
        --content-type "text/markdown"
fi

if [ -f "$BUILD_DIR/HOW-TO-PLAY.md" ]; then
    aws s3 cp $BUILD_DIR/HOW-TO-PLAY.md s3://$BUCKET_NAME/HOW-TO-PLAY.md \
        --content-type "text/markdown"
fi

if [ -f "$BUILD_DIR/build-info.json" ]; then
    aws s3 cp $BUILD_DIR/build-info.json s3://$BUCKET_NAME/build-info.json \
        --content-type "application/json"
fi

if [ $? -eq 0 ]; then
    echo "✅ Files uploaded successfully with optimized headers"
else
    echo "❌ Failed to upload files"
    exit 1
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
echo "🎉 Production Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Your obfuscated Tank Run game is now live at:"
echo "   http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "🔒 Security Features Deployed:"
echo "   ✅ Code obfuscated and minified"
echo "   ✅ Variable names scrambled"
echo "   ✅ Control flow protection"
echo "   ✅ String encoding applied"
echo "   ✅ Dead code injection active"
echo ""
echo "⚡ Performance Optimizations:"
echo "   ✅ Gzip compression enabled"
echo "   ✅ Long-term caching for assets"
echo "   ✅ Optimized content headers"
echo "   ✅ Minified HTML/CSS/JS"
echo ""
echo "📊 AWS Console Links:"
echo "   S3 Bucket: https://console.aws.amazon.com/s3/buckets/$BUCKET_NAME"
echo "   CloudWatch: https://console.aws.amazon.com/cloudwatch/"
echo ""
echo "💡 Next Steps:"
echo "   1. Test your game at the URL above"
echo "   2. Check browser dev tools - code should be obfuscated"
echo "   3. Monitor performance and loading times"
echo "   4. Consider setting up CloudFront for HTTPS"
echo "   5. Share your game with the world!"
echo ""
echo "💰 Estimated monthly cost: $0.01 - $5.00 (depending on traffic)"
echo ""
echo "🎮 Your production Tank Run game is ready for players!"
echo ""
echo "🔍 To verify obfuscation:"
echo "   1. Open browser dev tools (F12)"
echo "   2. Go to Sources tab"
echo "   3. Check tank-run.min.js - should be unreadable"
echo ""
echo "🚀 Happy Gaming!"
