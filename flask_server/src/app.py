from os import link
import re
from traceback import print_tb
from flask import Flask, render_template, request, redirect, session, url_for, flash, jsonify
from flask_mysqldb import MySQL
from flask_wtf.csrf import CSRFProtect
from flask_login import LoginManager, current_user, login_user, logout_user, login_required
import requests
from config import config
import json
from flask_cors import CORS


# Models:
from models.ModelUser import ModelUser

# Entities:
from models.entities.User import User

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": 
    {"origins": ["http://localhost:3000", "http://localhost:5000", "http://localhost:3306"]}})

csrf = CSRFProtect()
db = MySQL(app)
login_manager_app = LoginManager(app)


@login_manager_app.user_loader
def load_user(id):
    return ModelUser.get_by_id(db, id)

@app.route('/')
def index():
    return redirect(url_for('home'))

@app.route('/register', methods=['GET','POST'])
def register():
    try:
        if request.method == 'POST':
            token = request.form['csrf_token']
            new_user = User(0, request.form['username'], request.form['password'], request.form['fullname'], request.form['email'])
            created_user = ModelUser.register(db, new_user, token)
            user = User(0, request.form['username'], request.form['password'])
            logged_user = ModelUser.login(db, user, token)
            if logged_user != None:
                if logged_user.password:
                    login_user(logged_user)
                    return redirect('/home')

        return render_template('auth/register.html')
    except Exception as error:
        print(error)
        pass

@app.route('/login', methods=['GET', 'POST'])
def login():
    try:
        if request.method == 'POST':
            token = request.form['csrf_token']
            user = User(0, request.form['username'], request.form['password'])
            logged_user = ModelUser.login(db, user, token)
            if logged_user != None:
                if logged_user.password:
                    login_user(logged_user)
                    return redirect('/home')
                else:
                    flash("Invalid password...")
                    return render_template('auth/login.html')
            else:
                flash("User not found...")
                return render_template('auth/login.html')
        else:
            return render_template('auth/login.html')
    except Exception as error:
        print(error)
        pass

@app.route('/logout')
@login_required
def logout():
    try:
        logout_user()
        return redirect(url_for('home'))
    except Exception as error:
        print(error)
        pass

@app.route('/go_app')
@login_required
def go_app():
    try:
        return redirect('http://localhost:3000/dashboard')
    except Exception as error:
        print(error)
        pass

@app.route('/home')
def home():
   try:
       return render_template('home.html')
   except Exception as error:
        print(error)
        pass

def status_401(error):
    return redirect(url_for('login'))

def status_404(error):
    return jsonify({'error': "Not found"}), 404

@app.route('/me')
@login_required
def me():
    try:
        user = current_user.username
        fullname = current_user.fullname
        id = current_user.id
        auth = current_user.is_authenticated
    
        cursor = db.connection.cursor()
        sql = """SELECT token FROM user 
                        WHERE id = {}""".format(current_user.id)
        cursor.execute(sql)
        token = cursor.fetchone()
        cursor.close()
        return(jsonify({"username" : user, "fullname" : fullname, 
                        "id" : id, "auth" : auth, "token" : token}))
    except Exception as error:
        print(error)
        pass

@app.route("/dashboard")
@login_required
def dashboard():
    """Show all user data"""

    try:
        url = "https://cotizaciones-brou.herokuapp.com/api/currency/latest"

        payload = {}

        response = requests.request("GET", url, data=payload)

        return (jsonify(response.json()))
    except Exception as error:
        print(error)
        pass

@app.route("/transactions")
@login_required
def transactions():
    """Show all user transactions"""

    try:
        cursor = db.connection.cursor()
        sql = """SELECT link_id FROM bank_link 
                    WHERE user_id = {}""".format(current_user.id)
        cursor.execute(sql)
        link_id = cursor.fetchall()
        cursor.close()
    

        transaction_array = []
    
        for id in link_id:
            url = "https://api.stg.datanomik.com/v1/transactions?linkId={}".format(id[0])
    
            payload = {}
            headers = {
                'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE='
            }

            response = requests.request("GET", url, headers=headers, data=payload)
        
            for i in response.json()['content']:
                transaction_array.append(i)

        return (jsonify(transaction_array))
    except Exception as error:
        print(error)
        pass

@app.route("/links")
@login_required
def links():
    try:
        cursor = db.connection.cursor()
        sql = """SELECT link_id, bank FROM bank_link 
                    WHERE user_id = {}""".format(current_user.id)
        cursor.execute(sql)
        link_id = cursor.fetchall()
        cursor.close()
    
        all_links = []
    
        for id in link_id:
            all_links.append(id)

        return (jsonify(all_links))
    except Exception as error:
        print(error)
        pass

@app.route("/del_link", methods=["POST"])
@login_required
def del_link():
    try:
        data = request.get_json()
    
        link_id = data['id']

        url = "https://api.stg.datanomik.com/v1/links/{}".format(link_id)

        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
            'Content-Type': 'application/json'
        }

        response = requests.delete(url, headers=headers)
  
        cursor = db.connection.cursor()
        sql = """DELETE FROM bank_link 
                    WHERE link_id = '{}'""".format(link_id)
        cursor.execute(sql)
        db.connection.commit()
        cursor.close()
    
        return (jsonify(response.json()))
    
    except Exception as error:
        print(error)
        return(jsonify({'id' : 'hola'}))
    
def total_balance_uyu():
    """
    Print total amount of uyu and return it
    """
    # try:
    cursor = db.connection.cursor()
    sql = """SELECT link_id FROM bank_link 
                WHERE user_id = {}""".format(current_user.id)
    cursor.execute(sql)
    link_id = cursor.fetchall()
    cursor.close()
    amount = 0
    for id in link_id:
        url = "https://api.stg.datanomik.com/v1/accounts?linkId={}".format(id[0])

        payload = {}
        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
        }

        response = requests.request("GET", url, headers=headers, data=payload)

        response_json = response.json()

        #amount = 0
        for account in response_json["content"]:
            if account["balance"]["currency"] == "UYU":
                amount += int(account["balance"]["current_balance"])
    
    return (amount)
    
    # except Exception as error:
    #     print(error)
    #     return(jsonify(error))
    #     pass

def total_balance_usd():
    """
    Print total amount of usd and return it
    """
    # try:
    cursor = db.connection.cursor()
    sql = """SELECT link_id FROM bank_link 
                WHERE user_id = {}""".format(current_user.id)
    cursor.execute(sql)
    link_id = cursor.fetchall()
    cursor.close()

    amount = 0
    for id in link_id:
        url = "https://api.stg.datanomik.com/v1/accounts?linkId={}".format(id[0])

        payload = {}
        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
        }

        response = requests.request("GET", url, headers=headers, data=payload)

        response_json = response.json()

        for account in response_json["content"]:
            if account["balance"]["currency"] == "USD":
                amount += int(account["balance"]["current_balance"])
                        
    return (amount)
    
    # except Exception as error:
    #     print(error)
    #     return(jsonify(error))
    #     pass

def total_balance_eur():
    """
    Print total amount of eur and return it
    """
    #try:
    cursor = db.connection.cursor()
    sql = """SELECT link_id FROM bank_link 
                WHERE user_id = {}""".format(current_user.id)
    cursor.execute(sql)
    link_id = cursor.fetchall()
    cursor.close()
    amount = 0
    
    for id in link_id:
        url = "https://api.stg.datanomik.com/v1/accounts?linkId={}".format(id[0])

        payload = {}
        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
        }

        response = requests.request("GET", url, headers=headers, data=payload)

        response_json = response.json()

        for account in response_json["content"]:
            if account["balance"]["currency"] == "EUR":
                amount += int(account["balance"]["current_balance"])
            
    return (amount)
    
    # except Exception as error:
    #     print(error)
    #     return(jsonify(error))
    #     pass

def get_exchange_rate(currency="USD"):
    """
    Get exchange rate from the API BROU
    currency: exchange rate between UYU and currency selected
    the currency could be: USD or EUR, by default is set to "USD".
    We could also set the currency to: BRL (for reales) and ARG(for pesos)

    Info round method: https://www.adamsmith.haus/python/answers/how-to-limit-a-float-to-two-decimal-places-in-python#:~:text=format()%20to%20limit%20the,decimal%20places%20as%20a%20string.
    """
    #try:
    # Endpoint
    url = "https://cotizaciones-brou.herokuapp.com/api/currency/latest"
    # Request
    response = requests.request("GET", url)
    # Convert response to json
    response_json = response.json()
    # Get exchange rate - use of round method to round the number to 2 decimals
    exchange_rate = round(response_json["rates"][currency]["buy"], 2)
    return (exchange_rate)
    # except Exception as error:
    #     print(error)
    #     return(jsonify(error))
    #     pass

def convert_uyu_to_usd():
    """
    Convert UYU to USD
    """
    #try:
    # Get total balance in UYU
    total_uyu = total_balance_uyu()
    # Get exchange rate
    exchange_rate = int(get_exchange_rate("USD"))
    # Convert UYU to USD
    converted_amount = total_uyu / exchange_rate
    # Se convierte a entero para que no haya decimales
    return (int(converted_amount))
    # except Exception as error:
    #     print(error)
    #     return(jsonify(error))
    #     pass

def convert_eur_to_usd():
    """
    Convert EUR to USD
    """
    # try:
    # Get total balance in EUR
    total_eur = total_balance_eur()
    # Get exchange rate for EUR
    exchange_rate_eur = get_exchange_rate("EUR")
    # Get exchange rate for USD
    exchange_rate_usd = get_exchange_rate("USD")
    # Calculate exchange rate between EUR and USD:
    exchange_rate = exchange_rate_eur / exchange_rate_usd
    # Convert EUR to USD
    converted_amount = total_eur * exchange_rate
    return (int(converted_amount))
    # except Exception as error:
    #     print(error)
    #     return(jsonify(error))
    #     pass

@app.route("/total_balance")
@login_required
def total_balance():
    """
    Print total balance in USD converted
    """
    #try:
    # Get total balance in USD
    total_usd = total_balance_usd()
    # Get total balance in UYU converted to USD
    total_uyu_converted = convert_uyu_to_usd()
    # Get total balance in EUR converted to USD
    total_eur_converted = convert_eur_to_usd()
    # Calculate total balance in USD converted
    total_usd_converted = total_usd + total_uyu_converted + total_eur_converted
    return (jsonify(total_usd_converted))
    # except Exception as error:
    #     print(error)
    #     pass

def current_balance_by_bank(bank_name):
    """
    Function to get all current_balance by bank.
    Bank names could be: BROU, SCOTIABANK, ITAU, SANTANDER, HERITAGE, BANDES, BBVA
    """
    # Get exchange rates
    usd_exchange_rate = get_exchange_rate("USD")
    eur_exchange_rate = get_exchange_rate("EUR")
    # Calculate exchange rate between EUR and USD
    eur_to_usd = eur_exchange_rate / usd_exchange_rate

    # Get current balance of all banks by bank
    current_balance = 0
    
    cursor = db.connection.cursor()
    sql = """SELECT link_id FROM bank_link 
                WHERE user_id = {}""".format(current_user.id)
    cursor.execute(sql)
    link_id = cursor.fetchall()
    cursor.close()

    for id in link_id:
        url = "https://api.stg.datanomik.com/v1/assets?linkId={}".format(id[0])
        payload = {}
        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
        }

        response = requests.request("GET", url, headers=headers, data=payload)
        
        response_json = response.json()

        # Se hace un for para iterar por todos los bancos del que se pase como argumento
        for bank in response_json["content"]:
            if bank["institution"] == bank_name:
                currency = bank["accounts"][0]["balance"]["currency"]
                j = 0
                # Se hace un segundo for para poder iterar por todas las cuentas que tenga el link
                for account in bank["accounts"]:
                    currency = bank["accounts"][j]["balance"]["currency"]
                    if currency == "UYU":
                        current_balance += int(bank["accounts"][j]["balance"]["current_balance"]) / usd_exchange_rate
                    if currency == "USD":
                        current_balance += int(bank["accounts"][j]["balance"]["current_balance"])
                    if currency == "EUR":
                        current_balance += int(bank["accounts"][j]["balance"]["current_balance"]) * eur_to_usd
                    # Se incrementa el loop para que pase a la siguiente cuenta dentro del mismo link
                    j += 1

    print(f"Total current balance in {bank_name} in USD is: {int(current_balance)}")
    return (int(current_balance))

@app.route("/balance_per_bank")
@login_required
def balance_per_bank():
    """
    Function to get all current_balance by bank.
    Bank names could be: BROU, SCOTIABANK, ITAU, SANTANDER, HERITAGE, BANDES, BBVA
    """
    try:
        balances = {"BANDES" : 0,"BBVA" : 0,"BROU" : 0,
                    "HERITAGE" : 0,"ITAU" : 0,"SANTANDER" : 0,
                    "SCOTIABANK" : 0}
    
        cursor = db.connection.cursor()
        sql = """SELECT link_id, bank FROM bank_link 
                    WHERE user_id = {}""".format(current_user.id)
        cursor.execute(sql)
        link_id = cursor.fetchall()
        cursor.close()
    
        all_banks = []
    
        for id in link_id:
            all_banks.append(id[1])

        for bank in all_banks:
            balance = current_balance_by_bank(bank)
            if bank == 'BANDES':
                balances['BANDES'] = balance
            if bank == 'BBVA':
                balances['BBVA'] = balance
            if bank == 'BROU':
                balances['BROU'] = balance
            if bank == 'HERITAGE':
                balances['HERITAGE'] = balance
            if bank == 'ITAU':
                balances['ITAU'] = balance
            if bank == 'SANTANDER':
                balances['SANTANDER'] = balance
            if bank == 'SCOTIABANK':
                balances['SCOTIABANK'] = balance
                
        
        return(jsonify(balances))
    except Exception as error:
        print(error)
        return(jsonify(balances))
        pass

@app.route("/link_bandes", methods=["POST"])
@login_required
def create_bandes():
    """"""
    try:
        data = request.get_json()
    
        url = "https://api.stg.datanomik.com/v1/links"

        payload = json.dumps({
            "institution": "BANDES",
            "access_type": "BUSINESS",
            "country": "UY",
            "live": False,
            "recurrent": False,
            "description": "Prueba Bandes",
            "metadata": {
                "username": data['username'],
                "password":  data['password'],
                "description":  data['description']
            }
        })
        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
            'Content-Type': 'application/json'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        
        link_id = response.json()['id']
        bank_name = response.json()['institution']
        
        cursor = db.connection.cursor()
        ins_token = """INSERT INTO `bank_link` (`link_id`, `user_id`, `bank`) VALUES('{}', {}, '{}');""".format(link_id, current_user.id, bank_name)
        cursor.execute(ins_token)
        db.connection.commit()
        cursor.close()

        return (jsonify(response.json()))
    except Exception as error:
        print(error)
        pass

@app.route("/link_bbva", methods=["POST"])
@login_required
def create_bbva():
    """"""
    try:
        data = request.get_json()

        url = "https://api.stg.datanomik.com/v1/links"

        payload = json.dumps({
            "institution": "BBVA",
            "access_type": "BUSINESS",
            "country": "UY",
            "live": False,
            "recurrent": False,
            "description": "Prueba BBVA",
            "metadata": {
                "username": data['username'],
                "password": data['password'],
                "document_number": data['document_number']
            }
        })
        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
            'Content-Type': 'application/json'
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        link_id = response.json()['id']
        bank_name = response.json()['institution']
        
        cursor = db.connection.cursor()
        ins_token = """INSERT INTO `bank_link` (`link_id`, `user_id`, `bank`) VALUES('{}', {}, '{}');""".format(link_id, current_user.id, bank_name)
        cursor.execute(ins_token)
        db.connection.commit()
        cursor.close()

        return (jsonify(response.json()))
    except Exception as error:
        print(error)
        pass

@app.route("/link_brou", methods=["POST"])
@login_required
def create_brou():
    """"""
    try:
        data = request.get_json()

        url = "https://api.stg.datanomik.com/v1/links"

        payload = json.dumps({
            "institution": "BROU",
            "access_type": "BUSINESS",
            "country": "UY",
            "live": False,
            "recurrent": False,
            "description": "Prueba BROU",
            "metadata": {
                "username": data['username'],
                "password": data['password']
            }
        })
        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
            'Content-Type': 'application/json'
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        link_id = response.json()['id']
        bank_name = response.json()['institution']
        
        cursor = db.connection.cursor()
        ins_token = """INSERT INTO `bank_link` (`link_id`, `user_id`, `bank`) VALUES('{}', {}, '{}');""".format(link_id, current_user.id, bank_name)
        cursor.execute(ins_token)
        db.connection.commit()
        cursor.close()

        return (jsonify(response.json()))
    except Exception as error:
        print(error)
        pass

@app.route("/link_heritage", methods=["POST"])
@login_required
def create_heritage():
    """"""
    try:
        data = request.get_json()

        url = "https://api.stg.datanomik.com/v1/links"

        payload = json.dumps({
            "institution": "HERITAGE",
            "access_type": "BUSINESS",
            "country": "UY",
            "live": False,
            "recurrent": False,
            "description": "Prueba Heritage",
            "metadata": {
                "username": data['username'],
                "password": data['password'],
                "security_question": data['security_question'],
                "security_answer": data['security_answer']
            }
        })

        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
            'Content-Type': 'application/json'
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        link_id = response.json()['id']
        bank_name = response.json()['institution']
        
        cursor = db.connection.cursor()
        ins_token = """INSERT INTO `bank_link` (`link_id`, `user_id`, `bank`) VALUES('{}', {}, '{}');""".format(link_id, current_user.id, bank_name)
        cursor.execute(ins_token)
        db.connection.commit()
        cursor.close()

        return (jsonify(response.json()))
    except Exception as error:
        print(error)
        pass

@app.route("/link_itau", methods=["POST"])
@login_required
def create_itau():
    """"""
    try:
        data = request.get_json()

        url = "https://api.stg.datanomik.com/v1/links"

        payload = json.dumps({
            "institution": "ITAU",
            "access_type": "BUSINESS",
            "country": "UY",
            "live": False,
            "recurrent": False,
            "description": "Prueba Itau",
            "metadata": {
                "username": data['username'],
                "password": data['password'],
                "fiscal_number": data['fiscal_number']
            }
        })

        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
            'Content-Type': 'application/json'
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        link_id = response.json()['id']
        bank_name = response.json()['institution']
        
        cursor = db.connection.cursor()
        ins_token = """INSERT INTO `bank_link` (`link_id`, `user_id`, `bank`) VALUES('{}', {}, '{}');""".format(link_id, current_user.id, bank_name)
        cursor.execute(ins_token)
        db.connection.commit()
        cursor.close()

        return (jsonify(response.json()))
    except Exception as error:
        print(error)
        pass

@app.route("/link_santander", methods=["POST"])
@login_required
def create_santander():
    """"""
    try:
        data = request.get_json()

        url = "https://api.stg.datanomik.com/v1/links"

        payload = json.dumps({
            "institution": "SANTANDER",
            "access_type": "BUSINESS",
            "country": "UY",
            "live": False,
            "recurrent": False,
            "description": "Prueba Santander",
            "metadata": {
                "username": data['username'],
                "password": data['password']
            }
        })

        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
            'Content-Type': 'application/json'
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        link_id = response.json()['id']
        bank_name = response.json()['institution']
        
        cursor = db.connection.cursor()
        ins_token = """INSERT INTO `bank_link` (`link_id`, `user_id`, `bank`) VALUES('{}', {}, '{}');""".format(link_id, current_user.id, bank_name)
        cursor.execute(ins_token)
        db.connection.commit()
        cursor.close()

        return (jsonify(response.json()))
    except Exception as error:
        print(error)
        pass

@app.route("/link_scotiabank", methods=["POST"])
@login_required
def create_scotiabank():
    """"""
    try:
        data = request.get_json()
        
        url = "https://api.stg.datanomik.com/v1/links"

        payload = json.dumps({
            "institution": "SCOTIABANK",
            "access_type": "BUSINESS",
            "country": "UY",
            "live": False,
            "recurrent": False,
            "description": "Prueba Scotia 29-9-22",
            "metadata": {
                "username": data['username'],
                "password": data['password'],
                "digital_pin": data['digital_pin'],
                "description":  data['description']
            }
        })

        headers = {
            'Authorization': 'Basic MjQ1NDY2ZDctNWU0Ni00NzVjLWFiM2MtOTM3ODgxNmJkYWI3OlFiSUNhQ2tqTGNvQlJ2Q2NTWWlXWVFQT0ZxeXNVdE9IR3pGbk9WR29adlF2WE10YkRjaUJLVUZxanlSTlJvVGE=',
            'Content-Type': 'application/json'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        
        print(response.json())

        link_id = response.json()['id']
        bank_name = response.json()['institution']
        
        cursor = db.connection.cursor()
        ins_token = """INSERT INTO `bank_link` (`link_id`, `user_id`, `bank`) VALUES('{}', {}, '{}');""".format(link_id, current_user.id, bank_name)
        cursor.execute(ins_token)
        db.connection.commit()
        cursor.close()

        return (jsonify(response.json()))
    
    except Exception as error:
        print(error)
        pass

if __name__ == '__main__':
    app.config.from_object(config['development'])
    csrf.init_app(app)
    app.register_error_handler(401, status_401)
    app.register_error_handler(404, status_404)
    app.run(host='127.0.0.1', port='5000', debug=True)