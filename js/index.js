

ymaps.ready(init);
const template = document.getElementById("template").innerHTML;
let storage = localStorage;


function init(){
  let myMap = new ymaps.Map("map", {
    center: [55.71, 37.62],
    zoom: 11,
    behaviors: ['drag']
  });
  //Создание кластеризатора
  let clusterer = new ymaps.Clusterer({

 /**
             * Через кластеризатор можно указать только стили кластеров,
             * стили для меток нужно назначать каждой метке отдельно.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml
             */
            preset: 'islands#invertedVioletClusterIcons',
            /**
             * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
             */
            groupByCoordinates: false,
            /**
             * Опции кластеров указываем в кластеризаторе с префиксом "cluster".
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark.xml
             */
            clusterDisableClickZoom: true,
            clusterHideIconOnBalloonOpen: false,
            geoObjectHideIconOnBalloonOpen: false,
            hasBalloon: false


    
  });
  
  //Добавление клика по карте
  myMap.events.add('click', function (e) {
    const coords = e.get('coords');
    const form = addModal(coords)
    myMap.balloon.open(coords, form.innerHTML)
  })
  // Обработчик событий на кнопку "Добавить"
  document.body.addEventListener('click', addButtonClick);

  function addButtonClick(event) {
    if (event.target.className === 'addButton') {
      event.preventDefault();
      const reviewForm = document.querySelector(".form");
      const coords = JSON.parse(reviewForm.dataset.coords);
      const strCoords = coords.join('_')
      const name = document.getElementById('name').value
      const place = document.getElementById('place').value
      const comment = document.getElementById('message').value
      //Валидаця форм, запрет отправки пустых полей
      if (name == false ||
        place == false ||
        comment == false) {
        myMap.balloon.setData("Заполните поля")
        return
      }
      
      const data = { name, place, comment }; 
      if (storage.reviews==false) {
        storage.reviews = JSON.stringify({})
      }

      let reviews = JSON.parse(storage.reviews)

      if (strCoords in reviews) {
        reviews[strCoords].push(data);
        storage.reviews = JSON.stringify(reviews)
      } else {
        reviews[strCoords] = [];
        reviews[strCoords].push(data);
        storage.reviews = JSON.stringify(reviews)
      }
      myMap.balloon.close()
      createPlacemarks(JSON.parse(storage.reviews)) 
    }
  }

  // После добавления отзыва на карте появляется меткаи
  function createPlacemark(coords, reviewsCount) {
    
    let placemark

    //Вид меток зависит от количества отзывов
    if (reviewsCount > 1) {
    placemark = new ymaps.Placemark(
      coords,
      {iconContent: reviewsCount},
      {preset: 'islands#blueIcon'});
    } else { placemark = new ymaps.Placemark(coords)
    };

    placemark.events.add('click', (e) => {
      const coords = e.get('target').geometry.getCoordinates();
      openForm(coords)
    });
    return placemark
  }

  let placemarks = []
  //Показать метки, сохраненные в Localstorage
  function createPlacemarks(places) {
    for (let placeCoords in places) {
      placemarks = []
      let coords = placeCoords.split("_")
      let reviewCount = places[placeCoords].length
      let placemark = createPlacemark(coords, reviewCount)
      placemarks.push(placemark)

      myMap.geoObjects.add(clusterer)
      clusterer.add(placemarks)
    }
  }

  function openForm(coords){
    let reviews = getAllReviews(coords)
    let form = addModal(coords, reviews)
    myMap.balloon.open(coords, form.innerHTML)
  } createPlacemarks(JSON.parse(storage.reviews)) 
}

function getAllReviews(coords) {
  let coordString = coords.join('_')
  let reviews = JSON.parse(storage.reviews)
  if (reviews[coordString]) {
    return reviews[coordString]
  } else {
    []
  }
}

function addModal(coords, reviews) {
  const savedComments = document.createElement('div');
  savedComments.classList.add('balloon')
  savedComments.innerHTML = template;
  const reviewList = savedComments.querySelector('.comments');
  const reviewForm = savedComments.querySelector('.form');
  reviewForm.dataset.coords = JSON.stringify(coords);

  if (reviews) {
    for (const item of reviews) {
      let div = document.createElement('div');
      div.classList.add('comment-list');
      div.innerHTML = `
        <div>
          <div class="userName">${item.name}</div><div class="place">${item.place}</div>
        </div>
        <div class='message'>${item.text}</div><br/>
        `;
      reviewList.appendChild(div);
    }
  }
  return savedComments;
}