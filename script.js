document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const progressDots = document.querySelectorAll('.progress-dot');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const nextButtons = document.querySelectorAll('.next-btn');
    const form = document.getElementById('agendamento-form');

    // Elementos da geolocalização e autocompletar
    const getLocationButton = document.getElementById('get-location');
    const enderecoInput = document.getElementById('endereco');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const autocompleteList = document.createElement('ul');
    autocompleteList.id = 'autocomplete-list';
    enderecoInput.parentNode.appendChild(autocompleteList);

    // Elementos de data e horário
    const dataInput = document.getElementById('data-servico');
    const horarioInput = document.getElementById('horario-servico');

    let currentCardIndex = 0;

    // Função para mostrar o cartão atual e esconder os outros
    const showCard = (index) => {
        cards.forEach((card, i) => {
            card.style.display = i === index ? 'block' : 'none';
        });

        // Atualiza a barra de progresso
        progressDots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    // Inicia mostrando o primeiro cartão (índice 0)
    showCard(currentCardIndex);

    // Lógica: Puxar a data atual
    if (dataInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        dataInput.value = `${year}-${month}-${day}`;
    }

    // Lógica: Puxar a hora atual
    if (horarioInput) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        horarioInput.value = `${hours}:${minutes}`;
    }

    // Eventos dos botões "Próximo"
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextCardIndex = parseInt(button.dataset.card, 10);
            
            if (currentCardIndex === 0) {
                currentCardIndex = nextCardIndex;
                showCard(currentCardIndex);
                return;
            }
            
            const currentCard = cards[currentCardIndex];
            const inputs = currentCard.querySelectorAll('[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value) {
                    isValid = false;
                    input.style.border = '1px solid red';
                } else {
                    input.style.border = '';
                }
            });

            if (isValid) {
                currentCardIndex = nextCardIndex;
                showCard(currentCardIndex);
            } else {
                alert('Por favor, preencha todos os campos obrigatórios.');
            }
        });
    });

    // Eventos dos botões "Anterior"
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevCardIndex = parseInt(button.dataset.card, 10);
            currentCardIndex = prevCardIndex;
            showCard(currentCardIndex);
        });
    });

    // Lógica para o botão de geolocalização
    if (getLocationButton) {
        getLocationButton.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        latitudeInput.value = latitude;
                        longitudeInput.value = longitude;
                        enderecoInput.value = 'Localização obtida automaticamente';
                        alert('Localização obtida com sucesso! Você pode editar o endereço se necessário.');
                    },
                    (error) => {
                        console.error('Erro ao obter a localização:', error);
                        alert('Não foi possível obter sua localização. Por favor, digite seu endereço manualmente.');
                    }
                );
            } else {
                alert('A geolocalização não é suportada por este navegador.');
            }
        });
    }

    // Lógica de Autocompletar com OpenStreetMap Nominatim
    let autocompleteTimeout = null;
    enderecoInput.addEventListener('input', () => {
        clearTimeout(autocompleteTimeout);
        const query = enderecoInput.value;

        if (query.length < 3) {
            autocompleteList.innerHTML = '';
            return;
        }

        autocompleteTimeout = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=br`)
                .then(response => response.json())
                .then(data => {
                    displayAutocompleteSuggestions(data);
                })
                .catch(error => console.error('Erro na API de Autocompletar:', error));
        }, 500);
    });
    
    function displayAutocompleteSuggestions(predictions) {
        autocompleteList.innerHTML = '';
        predictions.forEach(prediction => {
            const li = document.createElement('li');
            li.textContent = prediction.display_name;
            li.addEventListener('click', () => {
                enderecoInput.value = prediction.display_name;
                latitudeInput.value = prediction.lat;
                longitudeInput.value = prediction.lon;
                autocompleteList.innerHTML = '';
            });
            autocompleteList.appendChild(li);
        });
    }

    // A lógica de envio via JavaScript foi removida.
    // O formulário agora será enviado diretamente para o Google Forms pelo HTML.

    const homeButton = document.querySelector('.home-btn');
    if (homeButton) {
        homeButton.addEventListener('click', () => {
            window.location.reload(); 
        });
    }
});