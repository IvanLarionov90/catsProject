'use strict';

document.addEventListener('DOMContentLoaded', function () {

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

    const rewData = async (url, data) => {
        const result = await fetch(url, {
            method: 'PUT',
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

    const inputs = document.querySelectorAll('input');
    for (const input of inputs) {
        input.value = localStorage[`input_${input.name}`] || '';
        input.addEventListener('change', function() {
            localStorage[`input_${this.name}`] = this.value;
        });
    }
    const textArea = document.querySelector('textarea');
    textArea.value = localStorage[`textarea_${textArea.name}`] || '';
    textArea.onchange = function() {
        localStorage[`textarea_${this.name}`] = this.value;
    };

    
    class CatCard {
        constructor(id, name, favourite, rate, age, description, img_link) {
            this.id = id;
            this.name = name;
            this.favourite = favourite;
            this.rate = rate;
            this.age = age + ' y.o';
            this.description = description;
            this.img_link = img_link;
        }

        delCard() {        
            fetch('http://sb-cats.herokuapp.com/api/2/LarisaKuklinova2000/delete/' + this.dataset.id, {
                method: 'DELETE',
            });
        }

        isFavour() {
            if (document.querySelector('.checkFav').checked) {
                return true;
            } else {
                return false;
            }
        }

        rewriteCard() {
            getResource('http://sb-cats.herokuapp.com/api/2/LarisaKuklinova2000/show/' + this.dataset.id)
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
                            <input name="id" type="text" placeholder="введите id" readonly required value="${data.data.id}">
                            <label for="age">возраст котика</label>
                            <input name="age" type="number" min="0" max="30" placeholder="сколько лет котику" required value="${data.data.age}">
                            <label for="name">имя котика</label>
                            <input name="name" type="text" placeholder="введите имя котика" readonly required value="${data.data.name}">
                            <label for="rate">рейтинг котика</label>
                            <input name="rate" type="number" min="1" max="10" placeholder="рейтинг котика" required value="${data.data.rate}">
                            <label for="description">описание котика</label>
                            <textarea class='textarea' name="description" type="text" placeholder="${data.data.description}" required"></textarea>
                            <label for="favourite">добавить в любимые</label>
                            <input name="favourite" type="checkbox" class="checkFav" checked>
                            <label for="img_link">ссылка на фото котика</label>
                            <input name="img_link" type="text" placeholder="ссылка на фото котика" required value="${data.data.img_link}">
                            <button type="submit" id="sendRewForm">изменить котика</button>
                        </form>
                    `;
                    document.querySelector('.main-overlay').append(element);
                    element.querySelector('.textarea').value = data.data.description;
                    element.style.left = '50%';
                    document.querySelectorAll('.modal__wrapper').forEach(item => {
                        item.style.left = '-100%';
                    });
                    function isfavourite() {
                        if (element.querySelector('.checkFav').checked) {
                            return true;
                        } else {
                            return false;
                        }
                    }

                    element.querySelector('.rewForm__items').addEventListener('submit', (e) => {
                        e.preventDefault();
                        const rewForm = Object.fromEntries(new FormData(document.querySelector('.rewForm__items')));
                        const rewBody = JSON.stringify({
                          id: rewForm.id,
                          name: rewForm.name,
                          favourite: isfavourite(),
                          rate: rewForm.rate,
                          age: rewForm.age,
                          description: rewForm.description,
                          img_link: rewForm.img_link,
                        });
                        rewData('http://sb-cats.herokuapp.com/api/2/LarisaKuklinova2000/update/' + rewForm.id, rewBody)
                            .then(document.querySelector('#sendRewForm').textContent = 'ЗАГРУЗКА')
                            .then(setTimeout(() => {
                                location.reload();
                            }, 1000));

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
            if (this.favourite) {
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
                    <div class="intro">хороший котя</div>
                </div>
                <div class="card-info">${this.description}</div>
                <div class="utility-info">
                    <ul class="utility-list">
                        <li class="raiting">${'<i class="fa-solid fa-star"></i>'.repeat(this.rate) + '<i class="fa-regular fa-star"></i>'.repeat(10-this.rate)}</li>
                        <li class="birth-date">${this.age}</li>
                        <li class="favourite">${this.favor()}</li>
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
                        <div class="modal__intro">хороший котя</div>
                        <div class="modal__descr">${this.description}</div>
                        <div class="utility-info">
                            <ul class="utility-list">
                                <li class="raiting">${'<i class="fa-solid fa-star"></i>'.repeat(this.rate) + '<i class="fa-regular fa-star"></i>'.repeat(10-this.rate)}</li>
                                <li class="birth-date">${this.age}</li>
                                <li class="favourite">${this.favor()}</li>
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

    getResource('http://sb-cats.herokuapp.com/api/2/LarisaKuklinova2000/show')
        .then(data => {data.data.forEach(({id, name, favourite, rate, age, description, img_link}) => {
            new CatCard(id, name, favourite, rate, age, description, img_link).init();
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
        const formData = Object.fromEntries(new FormData(myForm));

        function isFavour() {
            if (formData.favourite == 'on') {
                formData.favourite = true;
            } else {
                formData.favourite = false;
            }
        }
        isFavour();

        const json = JSON.stringify(formData);

        new CatCard(formData.id, 
            formData.name, 
            formData.favourite,
            formData.rate, 
            formData.age, 
            formData.description,
            formData.img_link).init();

        postData('http://sb-cats.herokuapp.com/api/2/LarisaKuklinova2000/add', json)
            .then(data => {
                console.log(data);
                statusMessage.textContent = message.success;
                statusMessage.style.cssText = messageCSS;
                myForm.insertAdjacentElement('afterend', statusMessage);
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