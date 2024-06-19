from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import json
from random import randint

app = Flask(__name__, static_folder='static')


@app.route('/')
def index():
    return render_template('brandy.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': 'Invalid username or password'}), 400

        with open('static/variable/data/login.json') as f:
            users = json.load(f)['users']

        for user in users:
            if user['username'] == username and user['password'] == password:
                return redirect('/brandy')

        return jsonify({'message': 'Invalid username or password'}), 400

    return render_template('login.html')


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Invalid username or password'}), 400

    with open('static/variable/data/login.json') as f:
        users = json.load(f)['users']

    for user in users:
        if user['username'] == username:
            return jsonify({'message': 'Username already exists'}), 400

    new_user = {'username': username, 'password': password}
    users.append(new_user)

    with open('static/variable/data/login.json', 'w') as f:
        json.dump({'users': users}, f, indent=4)

    return jsonify({'message': 'Sign up successful'}), 200


@app.route('/data')
def get_data():
    with open('variable/data/data.json') as f:
        data = json.load(f)
    return jsonify(data)


@app.route('/ainuNodeReqs')
def ainuNodeReqs():
    return render_template('ainu-node-reqs.html')


@app.route('/calculator')
def calculator():
    return render_template('calculator.html')


@app.route('/brackets')
def brackets():
    return render_template('brackets.html')


@app.route('/brandy')
def brandy():
    return render_template('brandy.html')


@app.route('/solitaire')
def solitaire():
    return render_template('solitaire.html')


@app.route('/get-card-image/<cardName>')
def get_card_image(cardName):
    cardImageUrl = url_for(
        'static', filename=f'variable/images/solitaire/cards/{cardName}.png')
    return jsonify({'cardImageUrl': cardImageUrl})


@app.route('/donkey')
def donkey():
    return render_template('donkey.html')


@app.route('/pong')
def pong():
    return render_template('pong.html')


@app.route('/timeline')
def timeline():
    return render_template('timeline.html')


@app.route('/jokes')
def jokes():
    return render_template('jokes.html')


@app.route('/data_jokes/get_jokes')
def get_jokes():
    with open('static/variable/data/jokes.json') as f:
        data = json.load(f)
    return jsonify(data)


@app.route('/data_jokes/new_joke_of_the_day')
def new_joke_of_the_day():
    with open('static/variable/data/jokes.json') as f:
        data = json.load(f)

    joke_objects = list(data['jokes'].values())
    random_index = randint(0, len(joke_objects) - 1)
    random_joke = joke_objects[random_index]

    response = {
        'joke_id': list(data['jokes'].keys())[random_index],
        'joke': random_joke['first_line']
    }

    data['joke_of_the_day'] = response

    with open('static/variable/data/jokes.json', 'w') as f:
        json.dump(data, f, indent=4)

    return jsonify(response)


@app.route('/data_jokes/get_joke_of_the_day')
def get_joke_of_the_day():
    with open('static/variable/data/jokes.json') as f:
        data = json.load(f)

    joke_of_the_day = list(data['joke_of_the_day'].values())
    response = {
        'joke_id': joke_of_the_day[0],
        'joke': joke_of_the_day[1]
    }

    return jsonify(response)


@app.route('/data_jokes/create_joke', methods=['POST'])
def create_joke():
    joke_data = request.get_json()

    with open('static/variable/data/jokes.json') as json_file:
        existing_data = json.load(json_file)

    jokes = existing_data['jokes']

    while True:
        joke_id = str(randint(1000, 9999))
        if joke_id not in jokes:
            break

    first_line = joke_data['first_line']
    punch_line = joke_data['punch_line']
    joke_topic = joke_data['joke_topic']

    jokes[joke_id] = {
        'first_line': first_line,
        'punch_line': punch_line,
        'joke_type': 'custom',
        'joke_topic': joke_topic
    }

    with open('static/variable/data/jokes.json', 'w') as json_file:
        json.dump(existing_data, json_file, indent=4)

    response = {
        'message': 'Joke created successfully',
        'joke_id': joke_id
    }
    return jsonify(response)


@app.route('/toDoList')
def toDoList():
    return render_template('to-do-list.html')


@app.route('/data_tasks/get_tasks')
def tasksGet():
    with open('static/variable/data/tasks.json', 'r') as json_file:
        data = json.load(json_file)
    return jsonify(data)


@app.route('/data_tasks/get_single_task/<int:item_id>', methods=['GET'])
def taskGet(item_id):
    with open('static/variable/data/tasks.json', 'r') as json_file:
        json_object = json.load(json_file)

    return jsonify(json_object["Tasks"][str(item_id)])


@app.route('/data_tasks/put_priority/<int:item_id>', methods=['PUT'])
def taskPut(item_id):
    json_path = 'static/variable/data/tasks.json'
    with open(json_path, 'r') as openfile:
        json_object = json.load(openfile)

    for key in json_object["Tasks"].keys():
        if str(key)[-3:] == str(item_id):
            item_id = key

    new_priority = request.json.get('priority')

    if new_priority == "Low":
        priority_number = "3"
    elif new_priority == "Medium":
        priority_number = "2"
    else:
        priority_number = "1"

    json_object["Tasks"][str(item_id)]["priority"] = new_priority
    id_slice = str(item_id)[-3:]
    json_object["Tasks"][f"{priority_number}{id_slice}"] = json_object["Tasks"].pop(
        str(item_id))

    with open(json_path, "w") as file:
        json.dump(json_object, file, indent=4)

    return jsonify({'status': 'OK'})


@app.route("/data_tasks/del_task/<int:item_id>", methods=['DELETE'])
def taskDel(item_id):
    json_path = 'static/variable/data/tasks.json'
    with open(json_path, 'r') as file:
        json_object = json.load(file)

    for key in json_object["Tasks"].keys():
        if str(key)[-3:] == str(item_id):
            item_id = key

    del json_object["Tasks"][str(item_id)]

    with open(json_path, "w") as file:
        json.dump(json_object, file, indent=4)

    return jsonify({'status': 'OK'})


@app.route('/data_tasks/post_task', methods=["POST"])
def taskPost():
    json_path = 'static/variable/data/tasks.json'
    task_data = request.get_json()
    with open(json_path, "r") as file:
        data = json.load(file)
        print(data)

    items = data["Tasks"]

    while True:
        item_ID = str(randint(100, 999))
        if item_ID not in items:
            break

    item_ID = f"4{item_ID}"

    itemTask = task_data['itemTaskAdd']
    itemDescription = task_data['itemDescriptionAdd']
    itemNotes = task_data['itemNotesAdd']

    items[item_ID] = {
        "task": itemTask,
        "description": itemDescription,
        "note": itemNotes
    }

    with open(json_path, "w") as file:
        json.dump(data, file, indent=4)

    response = {'task_id': item_ID}
    return jsonify(response)


@app.route('/blackjack-tracker')
def blackjackTracker():
    return render_template('blackjack-tracker.html')


json_file_path = os.path.join(os.path.dirname(
    __file__), 'static/variable/data/blackjack-scores.json')


def read_player_data():
    if os.path.exists(json_file_path):
        with open(json_file_path, 'r') as file:
            return json.load(file)
    else:
        return []


def write_player_data(players):
    with open(json_file_path, 'w') as file:
        json.dump(players, file, indent=2)


@app.route('/create_player', methods=['POST'])
def create_player():
    data = request.get_json()

    player_name = data.get('name', '').strip()

    if player_name:
        players = read_player_data()

        new_player = {
            'name': player_name,
            'results': {
                'wins': 0,
                'losses': 0,
                'draws': 0
            }
        }

        players.append(new_player)

        write_player_data(players)

        return jsonify(success=True, message='Player created successfully')
    else:
        return jsonify(success=False, message='Invalid player name'), 400


@app.route('/record_result', methods=['POST'])
def record_result():
    data = request.get_json()

    player_name = data.get('name', '').strip()
    result_type = data.get('result', '').lower()
    bet_amount = float(data.get('betAmount', 0))

    if player_name and result_type in ('win', 'loss', 'draw'):
        players = read_player_data()

        player = next((p for p in players if p['name'] == player_name), None)

        if player:
            if result_type == 'win':
                player['results']['wins'] += 1
                player['balance'] += bet_amount
            elif result_type == 'loss':
                player['results']['losses'] += 1
                player['balance'] -= bet_amount
            elif result_type == 'draw':
                player['results']['draws'] += 1
                player['balance'] -= bet_amount

            write_player_data(players)

            return jsonify(success=True, message='Result recorded successfully', player=player)
        else:
            return jsonify(success=False, message=f'Player "{player_name}" not found'), 404
    else:
        return jsonify(success=False, message='Invalid request data'), 400


@app.route('/update_balance', methods=['POST'])
def update_balance():
    data = request.get_json()

    player_name = data.get('name', '').strip()
    amount = float(data.get('amount', 0))

    if player_name:
        players = read_player_data()

        player = next((p for p in players if p['name'] == player_name), None)

        if player:
            player['balance'] = player.get('balance', 1000) + amount
            write_player_data(players)

            return jsonify(success=True, message='Balance updated successfully')
        else:
            return jsonify(success=False, message=f'Player "{player_name}" not found'), 404
    else:
        return jsonify(success=False, message='Invalid request data'), 400


@app.route('/get_player_info', methods=['POST'])
def get_player_info():
    data = request.get_json()

    player_name = data.get('name', '').strip()

    if player_name:
        players = read_player_data()
        player = next((p for p in players if p['name'] == player_name), None)

        if player:
            return jsonify(success=True, player=player)
        else:
            return jsonify(success=False, message=f'Player "{player_name}" not found'), 404
    else:
        return jsonify(success=False, message='Invalid request data'), 400


@app.route('/get_current_player', methods=['GET'])
def get_current_player():
    players = read_player_data()
    if players:
        current_player = players[-1]
        return jsonify(current_player)
    else:
        return jsonify(success=False, message='No current player'), 404


@app.route('/get_all_players', methods=['GET'])
def get_all_players():
    players = read_player_data()
    return jsonify(players)


@app.route('/delete_player', methods=['POST'])
def delete_player():
    data = request.get_json()

    player_name = data.get('name', '').strip()

    if player_name:
        players = read_player_data()

        updated_players = [
            player for player in players if player['name'] != player_name]

        write_player_data(updated_players)

        return jsonify(success=True, message='Player deleted successfully')
    else:
        return jsonify(success=False, message='Invalid player name'), 400


if __name__ == "__main__":
    app.run(debug="True")
