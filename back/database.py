import sqlite3

def get_connection():
    con = sqlite3.connect("banco.db")
    con.row_factory = sqlite3.Row
    return con
