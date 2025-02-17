//calendar
const currentDay = document.querySelector('.current-day');
const currentDate = document.querySelector('.date');
const currentTime = document.querySelector('.time');
const dayNumber = document.querySelector('.day-number');
const sunRise = document.querySelector('.sunrise');
const sunSet = document.querySelector('.sunset');
const input = document.querySelector('input');
const button = document.querySelector('button');

//weather
const cityName = document.querySelector('.city-name');
const warning = document.querySelector('.warning');
const photo = document.querySelector('.photo');
const temperature = document.querySelector('.temperature');

//toDoList
let todoInput;
let errorInfo;
let addBtn;
let ulList;
let newTodo;
let toolsPanel;
let completeBtn;
let editBtn;
let deleteBtn;
let popup;
let popupInfo;
let todoToEdit;
let popupInput;
let popupAddBtn;
let popupCloseBtn;

//API
const API_LINK = 'https://api.openweathermap.org/data/3.0/onecall/overview?';
const API_KEY = '&appid=25db98b4baeaae8f3186cd3bb3a1503b';
const API_UNITS = '&units=metric';
const URL =	'https://api.sunrisesunset.io/json?lat=53.1824306&lng=-22.0521838&date=today';

const getTime = () => {
	const date = new Date();
	currentDay.textContent = date.toLocaleString('pl', { weekday: 'long' });
	currentDate.textContent = date.toLocaleDateString();
	currentTime.textContent = date.toLocaleTimeString();
};

const dayOfYear = (date) =>
	Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    dayNumber.textContent = dayOfYear(new Date()) + ' dzień roku';

const getSun = () => {
	axios.get(URL).then((res) => {
		const sunRiseData = res.data.results.sunrise;
		const sunRiseFormat = sunRiseData.toLocaleString().slice(0, 4);
		sunRise.textContent = sunRiseFormat;

		const sunSetData = res.data.results.sunset;
		
		let hrs = Number(sunSetData.match(/^(\d+)/)[1]);
		let mnts = Number(sunSetData.match(/:(\d+)/)[1]);
		let format = sunSetData.match(/\s(.*)$/)[1];
		if (format == "PM" && hrs < 12) hrs = hrs + 12;
		if (format == "AM" && hrs == 12) hrs = hrs - 12;
        let hours = hrs.toString();
        let minutes = mnts.toString();
		if (hrs < 10) hours = "0" + hours;
		if (mnts < 10) minutes = "0" + minutes;
		let timeend = hours + ":" + minutes;
		sunSet.textContent = timeend;

	});
};

const getWeather = () => {
	const city = input.value || 'Lomza';
	const URL = API_LINK + city + API_KEY + API_UNITS;

	axios
		.get(URL)
		.then((res) => {
			const temp = res.data.main.temp;
			const hum = res.data.main.humidity;
			const status = Object.assign({}, ...res.data.weather);

			temperature.textContent = temp.toFixed(1) + '°C';
			cityName.textContent = res.data.name;

			const srise = res.data.sys.sunrise


			warning.textContent = '';
			input.value = '';


			if (status.id >= 200 && status.id < 300) {
				photo.setAttribute('src', './img/thinderstorm.svg');
			} else if (status.id >= 300 && status.id < 400) {
				photo.setAttribute('src', './img/drizzle.svg');
			} else if (status.id >= 500 && status.id < 600) {
				photo.setAttribute('src', './img/rain.svg');
			} else if (status.id >= 600 && status.id < 700) {
				photo.setAttribute('src', './img/ice.svg');
			} else if (status.id >= 701 && status.id < 800) {
				photo.setAttribute('src', './img/fog.svg');
			} else if (status.id === 800) {
				photo.setAttribute('src', './img/sun.svg');
			} else if (status.id >= 801 && status.id < 900) {
				photo.setAttribute('src', './img/cloud.svg');
			} else {
				photo.setAttribute('src', './img/unkown.png');
			}
		})
		.catch(() => (warning.textContent = 'Wpisz poprawną nazwę miasta!'));
};

const main = () => {
	prepareDOMElements();
	prepareDOMEvents();
};

const prepareDOMElements = () => {
	todoInput = document.querySelector('.todo-input');
	errorInfo = document.querySelector('.error-info');
	addBtn = document.querySelector('.btn-add');
	ulList = document.querySelector('.todolist ul');
	popup = document.querySelector('.popup');
	popupInfo = document.querySelector('.popup-info');
	popupInput = document.querySelector('.popup-input');
	popupAddBtn = document.querySelector('.accept');
	popupCloseBtn = document.querySelector('.cancel');
};

const prepareDOMEvents = () => {
	addBtn.addEventListener('click', addNewTodo);
	ulList.addEventListener('click', checkClick);
	popupCloseBtn.addEventListener('click', closePopup);
	popupAddBtn.addEventListener('click', changeTodoText);
	todoInput.addEventListener('keyup', enterKeyCheck);
};

const addNewTodo = () => {
	if (todoInput.value !== '') {
		newTodo = document.createElement('li'); //tworzymy nowy element
		newTodo.textContent = todoInput.value; //treść elementu jest pobierana z pola input
		createToolsArea();
		ulList.append(newTodo); //dodajemy nowy elemwnt do listy
		todoInput.value = ''; //po dodaniu elementu pole input zostaje wyczyszczone
		errorInfo.textContent = ''; //po dodoniu elementu pole z informacja zostaje wyczyszczone
	} else {
		errorInfo.textContent = 'Wpisz treść zadania';
	}
};

const createToolsArea = () => {
	toolsPanel = document.createElement('div');
	toolsPanel.classList.add('tools');
	newTodo.append(toolsPanel);

	completeBtn = document.createElement('button');
	completeBtn.classList.add('complete');
	completeBtn.innerHTML = '<i class="fas fa-check"></i>';

	editBtn = document.createElement('button');
	editBtn.classList.add('edit');
	editBtn.textContent = 'EDYCJA';

	deleteBtn = document.createElement('button');
	deleteBtn.classList.add('delete');
	deleteBtn.innerHTML = '<i class="fas fa-times"></i>';

	toolsPanel.append(completeBtn, editBtn, deleteBtn);
};

const checkClick = (e) => {
	if (e.target.matches('.complete')) {
		e.target.closest('li').classList.toggle('completed');
		e.target.classList.toggle('completed');
	} else if (e.target.matches('.edit')) {
		editTodo(e);
	} else if (e.target.matches('.delete')) {
		deleteTodo(e);
	}
};

const editTodo = (e) => {
	todoToEdit = e.target.closest('li');
	popupInput.value = todoToEdit.firstChild.textContent;

	popup.style.display = 'flex';
};

const closePopup = () => {
	popup.style.display = 'none';
};

const changeTodoText = () => {
	if (popupInput.value !== '') {
		todoToEdit.firstChild.textContent = popupInput.value;
		popup.style.display = 'none';
		popupInfo.textContent = '';
	} else {
		popupInfo.textContent = 'Musisz podać jakąś treść!';
	}
};

const deleteTodo = (e) => {
	e.target.closest('li').remove();

	const allTodos = ulList.querySelectorAll('li');

	if (allTodos.length === 0) {
		errorInfo.textContent = 'Brak zadań na liście';
	}
};

const enterKeyCheck = (e) => {
	if (e.key === 'Enter') {
		addNewTodo();
		getWeather();
	}
};

document.addEventListener('DOMContentLoaded', main);

getWeather();
input.addEventListener('keyup', enterKeyCheck);
button.addEventListener('click', getWeather);

setInterval(getTime, 1000);
setInterval(getWeather, 300000);
getTime();
getSun();
