from .entities.User import User
from werkzeug.security import generate_password_hash
from flask import flash


class ModelUser():
    @classmethod
    def register(self, db, user, token):
        try: 
            password = generate_password_hash(user.password) # ecnriptamos la pssw
            cursor = db.connection.cursor()
            try:
                sql = """INSERT INTO user (id, username, password, fullname, email, token)
                VALUES ({},'{}','{}','{}','{}','{}');""".format(user.id, user.username, password, user.fullname, user.email, token)
                cursor.execute(sql)
                db.connection.commit() # confirmar el insert en al db sino puf 
                cursor.close()
                # db.connection.close()
            except Exception as ex:
                    flash("Email or Username already exists...")
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def login(self, db, user, token):
        try:
            cursor = db.connection.cursor()
            sql = """SELECT id, username, password, fullname FROM user 
                    WHERE username = '{}'""".format(user.username)
            cursor.execute(sql)
            row = cursor.fetchone()
            cursor.close()
            if row != None:
                user = User(row[0], row[1], User.check_password(row[2], user.password), row[3])
                cursor = db.connection.cursor()
                ins_token = """UPDATE user SET token='{}' WHERE id={}""".format(token, user.id)
                cursor.execute(ins_token)
                db.connection.commit()
                cursor.close()
                return user
            else:
                return None
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def get_by_id(self, db, id):
        try:
            cursor = db.connection.cursor()
            sql = "SELECT id, username, fullname FROM user WHERE id = {}".format(id)
            cursor.execute(sql)
            row = cursor.fetchone()
            cursor.close()
            # db.connection.close()
            if row != None:
                return User(row[0], row[1], None, row[2])
            else:
                return None
        except Exception as ex:
            raise Exception(ex)
