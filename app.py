from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import csv
import os

app = Flask(__name__)
CORS(app) # Habilita o CORS para todas as rotas da aplicação

# NOVO: Defina o diretório onde o arquivo será salvo
SAVE_DIRECTORY = r'C:\Users\augusto.oliveira\Desktop\PYTHON\Formulario_visita'
FILENAME = 'agendamentos.csv'
FILE_PATH = os.path.join(SAVE_DIRECTORY, FILENAME)

# Rota para receber os dados do formulário
@app.route('/submit-form', methods=['POST'])
def submit_form():
    try:
        data = request.json
        print("Dados recebidos do formulário:", data)

        # Definição dos cabeçalhos do arquivo CSV
        fieldnames = [
            'nome', 'telefone', 'email', 'loja', 'servico', 'data-servico', 
            'horario-servico', 'endereco', 'latitude', 'longitude'
        ]

        # Verifica e cria o diretório se ele não existir
        if not os.path.exists(SAVE_DIRECTORY):
            os.makedirs(SAVE_DIRECTORY)
            print(f"Diretório criado: {SAVE_DIRECTORY}")

        # Verifica se o arquivo já existe para decidir se precisa escrever o cabeçalho
        file_exists = os.path.isfile(FILE_PATH)

        # Abre o arquivo em modo 'a' (append) para adicionar uma nova linha
        with open(FILE_PATH, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            # Escreve o cabeçalho se o arquivo for novo
            if not file_exists:
                writer.writeheader()

            # Escreve a nova linha com os dados do formulário
            writer.writerow(data)

        print(f"Dados salvos com sucesso em {FILE_PATH}")
        return jsonify({"message": "Dados salvos com sucesso!"}), 200

    except Exception as e:
        print("Erro ao processar o formulário:", e)
        return jsonify({"message": "Erro ao salvar os dados."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)