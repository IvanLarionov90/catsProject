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
            fetch('http://localhost:3004/cats/' + this.id, {
                method: 'DELETE',
            });
        }
    
        favor() {
            if (this.favorite) {
                return '<i class="fa-solid fa-heart" id="likes"></i>';
            } else {
                return '<i class="fa-regular fa-heart" id="likes"></i>';
            }
        }

        renderCards() {
            const element = document.createElement('div');
            element.classList.add('card', 'cat-card');
            element.style.background = `url(${this.img_link}) no-repeat`;
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
                    <i class="fa-solid fa-trash" id="${this.id}"></i>
                    <i class="fa-solid fa-pen-to-square" id="${this.id}"></i>
                </div>
            `;
            document.querySelector('.cards__wrapper').append(element);
        }

        renderModal() {
            const element = document.createElement('div');
            element.classList.add('modal__window');
            element.innerHTML = `
                <div class="modal__wrapper">
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
            document.querySelectorAll('#likes').forEach(like => {
                like.addEventListener('click', () => {
                    like.classList.toggle('fa-solid');
                    like.classList.toggle('fa-regular');
                });
            });

            document.querySelectorAll('#openModal').forEach((openModal, i) => {
                openModal.addEventListener('click', () => {
                    document.querySelector('.main-overlay').style.visibility = 'visible';
                    document.querySelectorAll('.modal__wrapper')[i].style.left = '50%';
                    document.body.style.overflow = 'hidden';
                });
            });

            document.querySelector('#openForm').addEventListener('click', () => {
                document.querySelector('.form').style.left = '50%';
                document.querySelector('.main-overlay').style.visibility = 'visible';
                document.body.style.overflow = 'hidden';
            });

            document.querySelectorAll('#modal__close').forEach(closeModal => {
                closeModal.addEventListener('click', () => {
                    document.querySelector('.main-overlay').style.visibility = 'hidden';
                    document.body.style.overflow = '';
                    document.querySelectorAll('.modal__wrapper').forEach(item => {
                        item.style.left = '-100%';
                    });
                    document.querySelector('.form').style.left = '-50%';
                });
            });

            document.querySelectorAll('.fa-trash').forEach((item, i) => {
                item.addEventListener('click', this.delCard);
                item.addEventListener('click', () => {
                    const arrCards = document.querySelectorAll('.card');
                    arrCards[i].style.display = 'none';
                });
            });
        }

        init() {
            this.renderCards();
            this.renderModal();
            this.setListeners();
        }
    }
    
    getResource('http://localhost:3004/cats').then(data => {
        data.forEach(({id, age, name, shortDescr, rate, description, favorite, img_link}) => {
            new CatCard(id, age, name, shortDescr, rate, description, favorite, img_link).init();
        });
    });

    const myForm = document.querySelector('.form__items'),
          message = {
            loading: 'cat are loading...',
            success: 'Thanks, your cat is in database',
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

        postData('http://localhost:3004/cats', json)
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

