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
    
        favor() {
            if (this.favorite) {
                return '<i class="fa-solid fa-heart" id="likes"></i>';
            } else {
                return '<i class="fa-regular fa-heart" id="likes"></i>';
            }
        }

        render() {
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
            `;
            document.querySelector('.cards__wrapper').append(element);
        }

        setListeners() {
            document.querySelectorAll('#likes').forEach(like => {
                like.addEventListener('click', () => {
                    like.classList.toggle('fa-solid');
                    like.classList.toggle('fa-regular');
                });
            });
        }

        init() {
            this.render();
            this.setListeners();
        }
    }
    
    getResource('http://localhost:3004/cats').then(data => {
        data.forEach(({id, age, name, shortDescr, rate, description, favorite, img_link}) => {
            new CatCard(id, age, name, shortDescr, rate, description, favorite, img_link).init();
        });
    });

});

