export default {
    async fetch(request, env) {
        try {
            mytoken = env.TOKEN || 'passwd';
            if (!env.KV) {
                throw new Error('KV 命名空间未绑定');
            }

            const url = new URL(request.url);
            const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;
            const parts = path.split('/');

            if (parts.length < 2) {
                return createResponse('格式错误', 403);
            }

            // 第一部分是 token，第二部分是 fileName
            const token = parts[0] || "null";
            let fileName = parts[1];
            if (token !== mytoken) {
                return createResponse('token 有误', 403);
            }
            if (!fileName) {
                return createResponse('File not found', 404);
            }

            fileName = fileName.toLowerCase(); // 将文件名转换为小写
            if(fileName === "config") {
                // 返回管理页面
                return createResponse(configHTML(url.hostname, token), 200, { 'Content-Type': 'text/html; charset=UTF-8' });
            }
            // 返回文件内容
            return await handleFileOperation(env.KV, fileName, url, token);
        } catch (error) {
            console.error("Error:", error);
            return createResponse(`Error: ${error.message}`, 500);
        }
    }
};

/**
 * 处理文件操作
 * @param {Object} KV - KV 命名空间实例
 * @param {String} fileName - 文件名
 * @param {Object} url - URL 实例
 * @param {String} token - 认证 token
 */
async function handleFileOperation(KV, fileName, url, token) {
    // 获取文件内容    
    const value = await KV.get(fileName, { cacheTtl: 60 });
    if (value === null) {
        return createResponse('File not found', 404);
    }
    return createResponse(value);
}

/**
 * 创建 HTTP 响应
 * @param {String} body - 响应内容
 * @param {Number} status - HTTP 状态码
 * @param {Object} additionalHeaders - 额外的响应头部信息
 */
function createResponse(body, status = 200, additionalHeaders = {}) {
    const headers = {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': Math.random().toString(36).substring(2, 15),
        'Last-Modified': new Date().toUTCString(),
        'cf-cache-status': 'DYNAMIC',
        ...additionalHeaders
    };
    return new Response(body, { status, headers });
}


/**
 * 生成 HTML 配置页面
 * @param {String} domain - 域名
 * @param {String} token - 认证 token
 */

function configHTML(domain, token) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CF-Workers-TEXT2KV 配置信息</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 15px; max-width: 800px; margin: 0 auto; }
        h1 { text-align: center; }
        h2 { text-align: left; font-size:1.3rem}
        pre,code { padding: 0px; border-radius: 8px; overflow-x: auto; white-space: nowrap; }
        pre code { background: none; padding: 0; border: none; }
        button { 
        white-space: nowrap;
        cursor: pointer; 
        padding: 10px 10px; 
        margin-top: 0px; 
        border: none; 
        border-radius: 5px; 
    flex-shrink: 0; /* 防止按钮缩小 */
        }
        button:hover { opacity: 0.9; }
        input[type="text"] { 
            padding: 9px 10px;
            border-radius: 5px;
            flex-grow: 1;
            min-width:0;
        }
        .tips {
            color:grey;
            font-size:0.8em;
            border-left: 1px solid #666;
            padding-left: 10px;
        }
        .container { 
        padding: 5px 15px 15px 15px; 
        border-radius: 10px; 
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            /* Flexbox layout for h2 and button */
        .flex-row { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-top:-10px !important;
        margin-bottom:-10px !important;
        }
        .download-button {
            padding: 5px 10px; /* 调整按钮的内边距，改变大小 */
            margin:0 !importan;
            background-color: Indigo !important; /* 设置按钮背景颜色 */
            color: white; /* 设置按钮文本颜色 */
            border: none; /* 去掉边框 */
            border-radius: 5px; /* 设置圆角 */
            cursor: pointer; /* 设置鼠标悬停时的光标样式 */
            transition: background-color 0.3s; /* 添加背景颜色的过渡效果 */
        }
        
        .download-button:hover {
            background-color: #45a049; /* 鼠标悬停时的背景颜色 */
        }
        .input-button-container {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        /* Light theme */
        body.light { background-color: #f0f0f0; color: #333; }
        h1.light { color: #444; }
        pre.light { background-color: #fff; border: 1px solid #ddd; }
        button.light { background-color: DarkViolet; color: #fff; }
        input[type="text"].light { border: 1px solid #ddd; }
        .container.light { background-color: #fff; }

        /* Dark theme */
        body.dark { background-color: #1e1e1e; color: #c9d1d9; }
        h1.dark { color: #c9d1d9; }
        pre.dark { background-color: #2d2d2d; border: 1px solid #444; }
        button.dark { background-color: DarkViolet; color: #c9d1d9; }
        input[type="text"].dark { border: 1px solid #444; }
        .container.dark { background-color: #2d2d2d; }
    </style>
    <!-- 引入 Highlight.js 的 CSS 文件 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/obsidian.min.css">
    <!-- 引入 Highlight.js 的 JavaScript 文件 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.body.classList.add(theme);
            document.querySelectorAll('h1, pre, button, input[type="text"], .container').forEach(el => el.classList.add(theme));
        });
    </script>
</head>
<body>
        <h1>TEXT2KV 配置信息</h1>
    <div class="container">

        <p>
            <strong>服务域名:</strong> ${domain}<br>
            <strong>TOKEN:</strong> ${token}<br>
        </p>
            <pre><code class="language-bash">curl "https://${domain}/config/update.sh?token=${token}&t=$(date +%s%N)" -o update.sh && chmod +x update.sh</code></pre>
            <h2>在线文档查询:</h2>
        <div class="input-button-container">
            <input type="text" id="keyword" placeholder="请输入要查询的文档">
            <button onclick="viewDocument()">查看文档内容</button>
            <button onclick="copyDocumentURL()">复制文档地址</button>
        </div>
    </div>
    <script>
        /**
         * 查看文档内容
         */
        function viewDocument() {
            const keyword = document.getElementById('keyword').value;
            window.open('https://${domain}/' + keyword + '?token=${token}&t=' + Date.now(), '_blank');
        }

        /**
         * 复制文档地址到剪贴板
         */
        function copyDocumentURL() {
            const keyword = document.getElementById('keyword').value;
            const url = 'https://${domain}/' + keyword + '?token=${token}&t=' + Date.now();
            navigator.clipboard.writeText(url).then(() => alert('文档地址已复制到剪贴板'));
        }

        /**
         * 复制 Linux 脚本到剪贴板
         */
        function copyLinuxScript() {
            const script = \`curl "https://${domain}/config/update.sh?token=${token}&t=$(date +%s%N)" -o update.sh && chmod +x update.sh\`;
            navigator.clipboard.writeText(script).then(() => alert('已复制到剪贴板'));
        }
    </script>
</body>
</html>
    `;
}
