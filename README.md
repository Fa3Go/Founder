# 要看的話，只需要直接看"web期末"這個資料夾
# 五七藝品官網 - 環境配置指南

## 系統需求

### Python 環境
- Python 3.8 或更高版本
- pip (Python 包管理器)


## 安裝步驟

### 1. Python 安裝
```bash
# Windows
# 從 https://www.python.org/downloads/ 下載並安裝 Python

# macOS
brew install python

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install python3 python3-pip
```

### 2. 創建虛擬環境
```bash
# 安裝 virtualenv
pip install virtualenv

# 創建虛擬環境
python -m venv venv

# 啟動虛擬環境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 3. 安裝必要套件
```bash
# 安裝基本套件
pip install flask
pip install llama-index
pip install google-generativeai
pip install python-dotenv

# 安裝文件處理相關套件
pip install pypdf  # PDF文件支援
pip install python-docx  # Word文件支援
pip install pandas  # 數據處理

# 安裝其他依賴
pip install requests
pip install numpy
```

### 4. 生成 requirements.txt
```bash
pip freeze > requirements.txt
```

### 5. 從 requirements.txt 安裝
```bash
pip install -r requirements.txt
```

## 專案配置

### 1. 環境變數設置
創建 `.env` 檔案：
```env
GEMINI_API_KEY=your_api_key_here
FLASK_ENV=development
FLASK_DEBUG=1
```

### 2. 目錄結構建立
```bash
mkdir static
mkdir static/css
mkdir static/js
mkdir templates
mkdir docs
mkdir storage
```

### 3. 檢查清單
- [ ] Python 3.8+ 已安裝
- [ ] 虛擬環境已創建並啟動
- [ ] 所有必要套件已安裝
- [ ] 環境變數已配置
- [ ] 專案目錄結構已建立
- [ ] Google Gemini API 金鑰已取得

## 常見問題解決

### 1. 套件安裝問題
如果遇到套件安裝錯誤：
```bash
# 更新 pip
python -m pip install --upgrade pip

# 清除 pip 快取
pip cache purge

# 強制重新安裝套件
pip install --force-reinstall [package-name]
```

### 2. 權限問題
```bash
# Linux/macOS 設置目錄權限
chmod -R 755 ./storage
chmod -R 755 ./docs
```

### 3. 路徑問題
確保在專案根目錄下執行命令，可以使用：
```bash
pwd  # 檢查當前目錄
cd path/to/project  # 切換到專案目錄
```

## 運行專案

### 1. 啟動服務器
```bash
# 確保在虛擬環境中
python app.py
```

### 2. 訪問網站
- 開發環境：http://localhost:5000
- 創辦人頁面：http://localhost:5000/founder

## 注意事項

1. **API 金鑰安全**
   - 不要將 API 金鑰提交到版本控制
   - 使用環境變數管理敏感信息

2. **虛擬環境管理**
   - 保持虛擬環境的獨立性
   - 定期更新 requirements.txt

3. **文件權限**
   - 確保 storage 和 docs 目錄可寫
   - 設置適當的文件權限

4. **版本相容性**
   - 注意 Python 版本相容性
   - 檢查套件版本衝突
