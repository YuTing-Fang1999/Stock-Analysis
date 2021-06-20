from flask import Flask, request, jsonify
from flask_cors import CORS
from strategies import *

import os
from lotify.client import Client
from dotenv import load_dotenv
# Get the path to the directory this file is in
BASEDIR = os.path.abspath(os.path.dirname(__file__))
# Connect the path with your '.env' file name
load_dotenv(os.path.join(BASEDIR, '.env'))
CLIENT_ID = os.getenv("LINE_CLIENT_ID")
SECRET = os.getenv("LINE_CLIENT_SECRET")
URI = os.getenv("LINE_REDIRECT_URI")
TOKEN = os.getenv("LINE_TOKEN")
lotify = Client(client_id=CLIENT_ID, client_secret=SECRET, redirect_uri=URI)

app = Flask(__name__)
CORS(app)

    # response.headers.add('Access-Control-Allow-Origin',
    #                      'http://localhost:9000')
@app.after_request  # 開發完要刪掉，有空再好好研究
def after_request(response):

    # response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', '*')
    return response


vs = VirtualStockAccount(account, passwd)


@app.route('/')
def index():
    return 'hello man'

@app.route('/line_notify', methods=['POST'])
def line_notify():
    payload = request.get_json()
    print(payload)
    msg = "\n買點: "+payload["method"]+"\n"
    msg += "\n".join(payload["sid"])
    response = lotify.send_message(
        # access_token=TOKEN, message=payload.get("sid")
        access_token=TOKEN, message=msg
    )
    return jsonify(result=response.get("message")), response.get("status")

@app.route('/price')
def price():
    sid = request.args["sid"]
    df = get_price(sid)
    buy_point,sell_point = get_buy_sell_point(df)
    
    return {
        "price": df.to_dict('records'),
        "buy_point": buy_point,
        "sell_point":sell_point
    }
# return request.args

@app.route('/game')
def game():
    sid = request.args["sid"]
    df = get_price(sid)
    buy_point,sell_point = get_buy_sell_point(df)
    
    return {
        "price": df.to_dict('records'),
        "buy_point": buy_point,
        "sell_point":sell_point
    }


@app.route('/bias_low')
def bias_low():
    return {"sid": get_bias_low_sid()}


@app.route('/macd')
def macd():
    # return {"sid": bias_low_sid}
    sid = get_macd_sid()
    print(sid)
    return {"sid": sid}


@app.route('/cmoney')
def cmoney():
    account = request.args["account"]
    data={}
    data["inventory_sid"] = []
    data["record_sid"] = []

    InventoryDetail = vs.status(account)  # 庫存明細
    
    for item in InventoryDetail[account]:
        data["inventory_sid"].append(item["Id"])

    orderRecord = vs.orderRecord("2021-3-14","2021-6-12",account) # 交易紀錄
    arr = {}
    for record in orderRecord[account]['data']:
        if record['Id'] not in data["inventory_sid"] and record['Id'] not in data["record_sid"]:
            data["record_sid"].append(record['Id'])

        if not record['Id'] in arr : arr[record['Id']] =[]
        arr[record['Id']].append([
            re.findall('<br>(\S*)</span>',record['TkT'])[0],
            re.findall('(\S*)<br><span',record['Time'])[0],
            record["DealPr"].replace(',','')
        ])
    data["record"] = arr

    return data


@app.route('/good')
def good():

    return{"sid": good_sid()}


if __name__ == '__main__':
    app.debug = True
    app.run()
