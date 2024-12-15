from flask import Flask, render_template, request, jsonify
import os
from llama_index.core import (
    Settings,
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.readers.file import PDFReader, DocxReader
from llama_index.readers.json import JSONReader
from datetime import datetime

app = Flask(__name__)

# 常數設定
PERSIST_DIR = "./storage"
GEMINI_API = "AIzaSyBUtF_r9ep-w4nwD0wvsOgI3utZDyMH36A"

# 配置 LlamaIndex
Settings.embed_model = GeminiEmbedding(
    model_name="models/embedding-001",  # 嵌入模型名稱
    api_key=GEMINI_API,
    max_length=512,  # 最大輸入文本長度
    temperature=0.7,  # 控制嵌入模型生成的多樣性
)
Settings.llm = Gemini(
    api_key=GEMINI_API,
    temperature=0.5,  # 控制生成的隨機性，越低越偏確定性
    max_tokens=300,  # 每次生成的最大字數
    top_p=0.9,  # Nucleus sampling，控制多樣性
    frequency_penalty=0.5,  # 避免生成重複的內容
    presence_penalty=0.6,  # 鼓勵模型生成新主題
)

# 用於儲存查詢歷史
query_history = []


def initialize_index(similarity_top_k=5):
    try:
        os.makedirs("docs", exist_ok=True)

        if not os.path.exists(PERSIST_DIR):
            if not os.listdir("docs"):
                print("docs 目錄為空，請添加文件")
                return None

            # 配置 reader 支援多種文件格式
            reader = SimpleDirectoryReader(
                "docs",
                file_extractor={
                    ".pdf": PDFReader(),
                    ".docx": DocxReader(),
                    ".json": JSONReader(),
                },
                filename_as_id=True,
                encoding="utf-8",
            )

            try:
                documents = reader.load_data()
                if not documents:
                    print("沒有讀取到任何文件")
                    return None
            except Exception as e:
                print(f"讀取文件時發生錯誤: {str(e)}")
                return None

            # 自定義文件切分設定
            sentence_splitter = SentenceSplitter(
                chunk_size=512,  # 每個文本區塊的大小（字元數） 較小的 chunk_size 會產生更多、更細緻的區塊
                chunk_overlap=50,  # 相鄰區塊間重疊的字元數 較大的 chunk_overlap 可以保持更好的上下文連貫性
                separator=" ",  # 分割句子的符號
                paragraph_separator="\n\n",  # 分割段落的符號
            )

            index = VectorStoreIndex.from_documents(
                documents,
                similarity_top_k=similarity_top_k,
                transformations=[sentence_splitter],
                show_progress=True,
            )

            index.storage_context.persist(persist_dir=PERSIST_DIR)
        else:
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            index = load_index_from_storage(storage_context)

        return index
    except Exception as e:
        print(f"初始化索引時發生錯誤: {str(e)}")
        return None


# 初始化索引
index = initialize_index()
query_engine = None  # 初始化 query_engine 為 None
if index:
    query_engine = index.as_query_engine(
        response_mode="tree_summarize",
        streaming=True,
    )


@app.route("/")
def home():
    return render_template("founder.html")


@app.route("/query", methods=["POST"])
def query():
    try:
        if not index:
            return jsonify({"error": "系統尚未初始化，請確保 docs 目錄中有文件"}), 500

        data = request.get_json()
        user_query = data.get("query")
        similarity_top_k = int(data.get("similarity_top_k", 5))

        if not user_query:
            return jsonify({"error": "請輸入查詢內容"}), 400

        formatted_query = (
            "請使用繁體中文回答以下問題，回答時請注意：\n"
            "1. 使用台灣用語和習慣\n"
            "2. 保持專業術語的正確性\n"
            "3. 回答要清楚易懂\n"
            f"問題：{user_query}"
        )

        if not query_engine:
            return jsonify({"error": "查詢引擎未初始化"}), 500

        response = query_engine.query(formatted_query)

        # 儲存查詢歷史
        query_history.append(
            {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "query": user_query,
                "response": str(response),
            }
        )

        return jsonify({"response": str(response)})

    except Exception as e:
        return jsonify({"error": f"查詢錯誤: {str(e)}"}), 500


@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        if "file" not in request.files:
            return jsonify({"error": "沒有上傳文件"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "沒有選擇文件"}), 400

        # 保存文件
        file.save(os.path.join("docs", file.filename))

        # 重新初始化索引
        global index, query_engine
        if os.path.exists(PERSIST_DIR):
            import shutil

            shutil.rmtree(PERSIST_DIR)

        index = initialize_index()
        if index:
            query_engine = index.as_query_engine(
                response_mode="tree_summarize",
                streaming=True,
            )
            return jsonify({"message": "文件上傳成功並重建索引"})
        else:
            return jsonify({"error": "索引建立失敗"}), 500

    except Exception as e:
        return jsonify({"error": f"上傳錯誤: {str(e)}"}), 500


# 添加新的路由來獲取歷史記錄
@app.route("/history", methods=["GET"])
def get_history():
    return jsonify({"history": query_history})


@app.route("/founder")
def founder():
    return render_template("founder.html")


@app.route("/index")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
