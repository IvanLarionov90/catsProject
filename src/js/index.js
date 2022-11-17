'use strict';

document.addEventListener('DOMContentLoaded', function () {

    const api = 'http://localhost:3004/cats/';

    const postData = async (url, data) => {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });
        return await result.json();
    };
    const getResource = async (url) => {
        const result = await fetch(url);
        if (!result.ok) {
            throw new Error(`could not fetch ${url}, status: ${result.status}`);
        }
        return await result.json();
    };
    
    class CatCard {
        constructor(id, age, name, shortDescr, rate, description, favorite, img_link) {
            this.id = id;
            this.age = age + ' y.o';
            this.name = name;
            this.shortDescr = shortDescr;
            this.rate = rate;
            this.description = description;
            this.favorite = favorite;
            this.img_link = img_link;
        }

        delCard() {        
            fetch(api + this.dataset.id, {
                method: 'DELETE',
            });
        }

        rewriteCard() {
            getResource(api + this.dataset.id)
                .then(data => {
                    document.querySelector('.main-overlay').style.visibility = 'visible';
                    document.body.style.overflow = 'hidden';
                    const element = document.createElement('div');
                    element.classList.add('rewForm');
                    element.innerHTML = `
                        <i class="fa-regular fa-circle-xmark" id="modal__close"></i>
                        <h2>введите новые данные котика</h2>
                        <form class="rewForm__items">
                            <label for="id">идентификатор котика</label>
                            <input name="id" type="text" placeholder="введите id" readonly required value="${data.id}">
                            <label for="age">возраст котика</label>
                            <input name="age" type="number" min="0" max="30" placeholder="сколько лет котику" required value="${data.age}">
                            <label for="name">имя котика</label>
                            <input name="name" type="text" placeholder="введите имя котика" required value="${data.name}">
                            <label for="shortDescr">краткое описание котика</label>
                            <input name="shortDescr" type="text" placeholder="краткое описание котика" required value="${data.shortDescr}">
                            <label for="rate">рейтинг котика</label>
                            <input name="rate" type="number" min="1" max="10" placeholder="рейтинг котика" required value="${data.rate}">
                            <label for="description">описание котика</label>
                            <textarea class='textarea' name="description" type="text" placeholder="${data.description}" required"></textarea>
                            <label for="favorite">добавить в любимые</label>
                            <input name="favorite" type="checkbox" class="checkFav" checked>
                            <label for="img_link">ссылка на фото котика</label>
                            <input name="img_link" type="text" placeholder="ссылка на фото котика" required value="${data.img_link}">
                            <button type="submit" id="sendRewForm">изменить котика</button>
                        </form>
                    `;
                    document.querySelector('.main-overlay').append(element);
                    element.querySelector('.textarea').value = data.description;
                    element.style.left = '50%';
                    document.querySelectorAll('.modal__wrapper').forEach(item => {
                        item.style.left = '-100%';
                    });
                    function isFavorite() {
                        if (element.querySelector('.checkFav').checked) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    element.querySelector('.rewForm__items').addEventListener('submit', () => {
                        const rewForm = Object.fromEntries(new FormData(document.querySelector('.rewForm__items')));
                        fetch(api + rewForm.id, {
                            method: 'PATCH',
                            body: JSON.stringify({
                                id: rewForm.id,
                                age: rewForm.age,
                                name: rewForm.name,
                                shortDescr: rewForm.shortDescr,
                                rate: rewForm.rate,
                                description: rewForm.description,
                                favorite: isFavorite(),
                                img_link: rewForm.img_link
                            }),
                            headers: {
                                'Content-type': 'application/json'
                            }
                        });
                    });

                    element.querySelector('.fa-circle-xmark').addEventListener('click', () => {
                        element.style.left = '-50%';
                        document.querySelector('.main-overlay').style.visibility = 'hidden';
                        document.body.style.overflow = '';
                        setInterval(() => {
                           element.remove(); 
                        }, 2000);
                    });
                });
        }
    
        favor() {
            if (this.favorite) {
                return '<i class="fa-solid fa-heart likes"></i>';
            } else {
                return '<i class="fa-regular fa-heart likes"></i>';
            }
        }

        closeAllModal() {
            document.querySelectorAll('.modal__wrapper').forEach(item => {
                item.style.left = '-100%';
            });
        }

        renderCards() {
            const element = document.createElement('div');
            element.classList.add('card', 'cat-card');
            element.style.background = `url(${this.img_link}) center center/cover no-repeat`;
            element.innerHTML = `
                <div class="title-content">
                    <h3>${this.name}</h3>
                    <hr/>
                    <div class="intro">${this.shortDescr}</div>
                </div>
                <div class="card-info">${this.description}</div>
                <div class="utility-info">
                    <ul class="utility-list">
                        <li class="raiting">${'<i class="fa-solid fa-star"></i>'.repeat(this.rate) + '<i class="fa-regular fa-star"></i>'.repeat(10-this.rate)}</li>
                        <li class="birth-date">${this.age}</li>
                        <li class="favorite">${this.favor()}</li>
                    </ul>
                </div>
                <div class="gradient-overlay"></div>
                <div class="color-overlay"></div>
                <i class="fa-solid fa-arrow-up-right-from-square" id="openModal"></i>
                <div class="edit-or-delete">
                    <i class="fa-solid fa-trash fa-trash-card" data-id=${this.id}></i>
                    <i class="fa-solid fa-pen-to-square" data-id=${this.id}></i>
                </div>
            `;
            document.querySelector('.cards__wrapper').append(element);

        }

        renderModal() {
            const element = document.createElement('div');
            element.classList.add('modal__window');
            element.innerHTML = `
                <div class="modal__wrapper">
                    <i class="fa-solid fa-trash fa-trash-modal" data-id=${this.id}></i>
                    <i class="fa-solid fa-pen-to-square" data-id=${this.id}></i>
                    <i class="fa-regular fa-circle-xmark" id="modal__close"></i>
                    <div class="modal__photo">
                        <img class="modalCatImg" src="${this.img_link}" alt="catimg">
                    </div>
                    <div class="modal__info">
                        <h3 class="modal__name">${this.name}</h3>
                        <div class="modal__intro">${this.shortDescr}</div>
                        <div class="modal__descr">${this.description}</div>
                        <div class="utility-info">
                            <ul class="utility-list">
                                <li class="raiting">${'<i class="fa-solid fa-star"></i>'.repeat(this.rate) + '<i class="fa-regular fa-star"></i>'.repeat(10-this.rate)}</li>
                                <li class="birth-date">${this.age}</li>
                                <li class="favorite">${this.favor()}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            document.querySelector('.main-overlay').append(element);
            document.querySelectorAll('.modal__wrapper').forEach(item => {
                item.style.left = '-50%';
            });
        }

        setListeners() {

            const cards = document.querySelectorAll('.card'),
                  overlay = document.querySelector('.main-overlay');

            cards.forEach((card, i) => {
                card.addEventListener('click', (e) => {
                    if (e.target.classList.contains('likes')) {
                        e.target.classList.toggle('fa-solid');
                        e.target.classList.toggle('fa-regular');
                    }
                    if (e.target.id == 'openModal') {
                        document.querySelector('.main-overlay').style.visibility = 'visible';
                        document.querySelectorAll('.modal__wrapper')[i].style.left = '50%';
                        document.body.style.overflow = 'hidden';
                    }
                });
            });

            overlay.addEventListener('click', (e) => {
                if (e.target.id == 'modal__close') {
                    document.querySelector('.main-overlay').style.visibility = 'hidden';
                    document.body.style.overflow = '';
                    this.closeAllModal();
                    document.querySelector('.form').style.left = '-50%';
                }
            });

            document.querySelector('#openForm').addEventListener('click', () => {
                document.querySelector('.form').style.left = '50%';
                document.querySelector('.main-overlay').style.visibility = 'visible';
                document.body.style.overflow = 'hidden';
            });
            document.querySelectorAll('.fa-pen-to-square').forEach((item) => {
                item.addEventListener('click', this.rewriteCard);
            });
            document.querySelectorAll('.fa-trash-card').forEach((item, i) => {
                item.addEventListener('click', this.delCard);
                item.addEventListener('click', () => {
                    const arrCards = document.querySelectorAll('.card');
                    arrCards[i].style.display = 'none';
                });
            });
            document.querySelectorAll('.fa-trash-modal').forEach((item, i) => {
                item.addEventListener('click', this.delCard);
                item.addEventListener('click', () => {
                    const arrCards = document.querySelectorAll('.card');
                    arrCards[i].style.display = 'none';
                    this.closeAllModal();
                    document.querySelector('.main-overlay').style.visibility = 'hidden';
                    document.body.style.overflow = '';
                });
            });
        }

        init() {
            this.renderCards();
            this.renderModal();
            this.setListeners();
        }
    }
    
    getResource(api).then(data => {
        data.forEach(({id, age, name, shortDescr, rate, description, favorite, img_link}) => {
            new CatCard(id, age, name, shortDescr, rate, description, favorite, img_link).init();
        });
    });

    const myForm = document.querySelector('.form__items'),
          message = {
            loading: 'cat are loading...',
            success: 'Thanks, your cat is in database!',
            failure: 'Something wrong...'
            },
          messageCSS = 'display: block; margin: 0 auto; text-align: center; color: white; margin-top: 10px;';
    myForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const statusMessage = document.createElement('div');
        statusMessage.textContent = message.loading;
        statusMessage.style.cssText = messageCSS;
        myForm.insertAdjacentElement('afterend', statusMessage);
        const json = JSON.stringify(Object.fromEntries(new FormData(myForm)));
        postData(api, json)
            .then(data => {
                console.log(data);
                statusMessage.textContent = message.success;
                statusMessage.style.cssText = messageCSS;
                myForm.insertAdjacentElement('afterend', statusMessage);
                new CatCard(data.id, 
                            data.age, 
                            data.name, 
                            data.shortDescr, 
                            data.rate, 
                            data.description, 
                            data.favorite, 
                            data.img_link).init();
            }).catch(() => {
                statusMessage.textContent = message.failure;
                statusMessage.style.cssText = messageCSS;
                myForm.insertAdjacentElement('afterend', statusMessage);
            }).finally(() => {
                myForm.reset();
                setTimeout(() => {
                    document.querySelector('.form').style.left = '-50%';
                    document.querySelector('.main-overlay').style.visibility = 'hidden';
                    document.body.style.overflow = '';
                }, 2000);
            });
    });
});

