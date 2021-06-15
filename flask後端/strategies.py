from finlab.data import Data
import requests
import json
import re
import time
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup as bs

data = Data()
amount = 1000
close = data.get('收盤價', amount).fillna(0)
open_ = data.get('開盤價', amount)
high = data.get('最高價', amount)
low = data.get('最低價', amount)
volume = data.get('成交股數', amount).fillna(0)

# tail_vol = volume.dropna(axis=1).iloc[-1]
# tail_vol[tail_vol>1000000]
# hot = tail_vol.index
macd_range=5
def myMACD(close_arr,calcParams = [12, 26, 9]):
    closeSum = 0
    emaShort = 0
    emaLong = 0
    dif = 0
    difSum = 0
    dea = 0
    macd = {}
    macd["dif"] = []
    macd["macd"] = []
    macd["dea"] = []
    maxPeriod = max(calcParams[0], calcParams[1])
    for i, c in enumerate(close_arr):

        close = c
        closeSum += close
        if i >= calcParams[0] - 1:
            if (i > calcParams[0] - 1) :
              emaShort = (2 * close + (calcParams[0] - 1) * emaShort) / (calcParams[0] + 1)
            else:
              emaShort = closeSum / calcParams[0]


        if i >= calcParams[1] - 1:
            if i > calcParams[1] - 1:
              emaLong = (2 * close + (calcParams[1] - 1) * emaLong) / (calcParams[1] + 1)
            else:
              emaLong = closeSum / calcParams[1]


        if i >= maxPeriod - 1:
            dif = emaShort - emaLong
            macd["dif"].append(dif)
            difSum += dif
            if i >= maxPeriod + calcParams[2] - 2:
              if i > maxPeriod + calcParams[2] - 2: 
                dea = (dif * 2 + dea * (calcParams[2] - 1)) / (calcParams[2] + 1)
              else:
                dea = difSum / calcParams[2]

              macd["macd"].append(np.round((dif - dea) * 2,4))
              macd["dea"].append(np.round(dea,4))
    return macd

def macd_buy(arr):
    if ###########secret^^##############
                return True 
    return False 

def macd_sell(arr):
    if ###########secret^^##############
                return True 
    return False 
    
   

def  get_buy_sell_point(df):
    close_arr = df["close"].values
    calcParams = [12, 26, 9]
    macd = myMACD(close_arr,calcParams)
    DIF = macd["dif"]
    DEA = macd["dea"]
    MACD = macd["macd"]

    buy_point=[]
    sell_point=[]

    for i in range(7,len(MACD)+1):
        if macd_sell(MACD[i-macd_range:i]):
            sell_point.append(i+calcParams[1] + calcParams[2] - 2)
        if macd_buy(MACD[i-macd_range:i]):
            buy_point.append(i+calcParams[1] + calcParams[2] - 2)



    return buy_point,sell_point

    


def get_price(sid):
    df = pd.DataFrame({"timestamp": close[sid].index.values.astype(np.int64) // 10 ** 6, "open": open_[
        sid], "close": close[sid], "low": low[sid], "high": high[sid], "volume": volume[sid]})
    df = df.dropna()
    return df


def bias_isBuy(close, m1=600, m2=200, m3=1, m4=1, draw_plot=False):

    sma = close.rolling(m1).mean()

    bias = (close / sma)
    ub = 1 + bias.rolling(m2).std() * m3
    lb = 1 - bias.rolling(m2).std() * m4

    buy = (bias < lb)
    sell = (bias > ub)

    return sell.tail(1).values[0]


def get_bias_low_sid():
    bias_low_sid = []
    for sid in volume.columns:
        if volume[sid].iloc[-1] > 100000 and bias_isBuy(close[sid]) and close[sid].iloc[-1]-close[sid].iloc[-2] > 0:
            bias_low_sid.append(sid)
    return bias_low_sid


def get_macd_sid():
    # 使用talib计算MACD的参数
    short_win = 12    # 短期EMA平滑天数
    long_win = 26    # 长期EMA平滑天数
    macd_win = 9     # DEA线平滑天数

    calcParams = [12, 26, 9]

    sids = close.iloc[-1].index

    buy = []
    close_dic = close.iloc[-50:].to_dict('list')
    for sid in sids:
        prices = close_dic[sid]
        if prices is None:
            continue
        # print(prices)
        macd = myMACD(prices)
        MACD = macd["macd"]

        i = len(MACD)+1
        # 判断MACD走向
        if macd_buy(MACD[i-macd_range:i]):
            # print(sid)
            buy.append(sid)
    return buy

############# cmoney #############


class VirtualStockAccount():

    def __init__(self, email, password, wait_time=1):
   
        """
        輸入帳號(email)密碼(password)來登入，並設定每個request的延遲時間是wait_time
        """

        self.ses = requests.Session()
        res = self.ses.get('https://www.cmoney.tw/member/login/')
        self.wait_time = wait_time

        # get view state
        viewstate = re.search( 'VIEWSTATE"\s+value=.*=', res.text )
        viewstate = viewstate.group()

        # get eventvalidation
        eventvalidation = re.search( 'EVENTVALIDATION"\s+value=.*\w', res.text )
        eventvalidation = eventvalidation.group( )

        time.sleep(self.wait_time)

        res = self.ses.post('https://www.cmoney.tw/member/login/', {
                '__VIEWSTATE': viewstate[18:],
            '__EVENTVALIDATION': eventvalidation[24:],
            'ctl00$ContentPlaceHolder1$account': email,
            'ctl00$ContentPlaceHolder1$pw': password,
            'ctl00$ContentPlaceHolder1$loginBtn': '登入',
            'ctl00$ContentPlaceHolder1$check': 'on',
        })

        time.sleep(self.wait_time)

        res = self.ses.get('https://www.cmoney.tw/vt/main-page.aspx')

        soup = bs(res.text,"lxml") #aid
        NaviMyAccountList = soup.find(id='NaviMyAccountList').find_all("li")
        aids = re.findall('aid=[\d]*', str(NaviMyAccountList) )
        aids = [a.split('=')[1] for a in aids]
        aids = [a for a in aids if a.isdigit()]
        self.aids = aids
        
        if self.aids:
            self.aid = aids[0]
        else:
            raise Exception('Cannot open account due to incorrect account name or password')
            
            
        accounts = {}
        for i in range(len(NaviMyAccountList)):
            title = NaviMyAccountList[i].find('a')['title']
            accounts[title] = self.aids[i]
       
        self.accounts = accounts
        print(self.accounts)
        
    def info(self): # 帳戶蓋覽
        data = {}
        
        for key, v in self.accounts.items():

            res = self.ses.get('https://www.cmoney.tw/vt/ashx/accountdata.ashx?act=AccountInfo&aid=%s&_=1572343162391' % v)


            data[key] = json.loads(res.text)

        return data
    def status(self,account): # 庫存明細

        """
        查看目前account的狀態：
        [{'Id': '1101',
          'Name': '台泥',
          'TkT': '現股',
          'NowPr': '43.05',
          'DeAvgPr': '43.20',
          'IQty': '1',
          'IncomeLoss': '-402',
          'Ratio': '-0.93',
          'Cost': '43,200.00',
          'ShowCost': '43,200.00',
          'TodayQty': '0',
          'BoardLostSize': '1000',
          'IsWarrant': '0'}]
        """
        data = {}
        
#         for key, v in self.accounts.items():

        res = self.ses.get('https://www.cmoney.tw/vt/ashx/accountdata.ashx', params={
            'act': 'InventoryDetail',
            'aid': self.accounts[account],
        })

        data[account] = json.loads(res.text)

        return data
    
    def intrust(self, account): #委託查詢
        data = {}
#         for key, v in self.accounts.items():
        res = self.ses.get('https://www.cmoney.tw/vt/ashx/accountdata.ashx', params={
            'act': 'EntrustQuery',
            'aid': self.accounts[account],
        })
        data[account] = json.loads(res.text)

        return data
    
    def orderRecord(self,startTime,endTime,account): #交易紀錄
        data = {}
#         for key, v in self.accounts.items():
        res = self.ses.get('https://www.cmoney.tw/vt/ashx/accountdata.ashx', params={
            'act': 'OrderRecord',
            'aid': self.accounts[account],
            'startTime': startTime,
            'endTime': endTime
        })
        data[account] = json.loads(res.text)

        return data


##################策略#################
# 將每季累計的財務數據改成單季的數據
def toSeasonal(df):
    season4 = df[df.index.month == 3]
    season1 = df[df.index.month == 5]
    season2 = df[df.index.month == 8]
    season3 = df[df.index.month == 11]

    season1.index = season1.index.year
    season2.index = season2.index.year
    season3.index = season3.index.year
    season4.index = season4.index.year - 1

    newseason1 = season1
    newseason2 = season2 - season1.reindex_like(season2)
    newseason3 = season3 - season2.reindex_like(season3)
    newseason4 = season4 - season3.reindex_like(season4)

    newseason1.index = pd.to_datetime(newseason1.index.astype(str) + '-05-15')
    newseason2.index = pd.to_datetime(newseason2.index.astype(str) + '-08-14')
    newseason3.index = pd.to_datetime(newseason3.index.astype(str) + '-11-14')
    newseason4.index = pd.to_datetime(
        (newseason4.index + 1).astype(str) + '-03-31')

    return newseason1.append(newseason2).append(newseason3).append(newseason4).sort_index()


def mystrategy(data):

    ###########secret^^##############
    return select_stock[select_stock]


def good_sid():
    return mystrategy(data).index.to_list()
