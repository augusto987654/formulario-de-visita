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
    if (enderecoInput) {
        enderecoInput.parentNode.appendChild(autocompleteList);
    }

    // Elementos de data e horário
    const dataInput = document.getElementById('data-servico');
    const horarioInput = document.getElementById('horario-servico');

    let currentCardIndex = 0;

    // Função para mostrar o cartão atual e esconder os outros
    const showCard = (cardId) => {
        let newIndex = 0;
        cards.forEach((card, i) => {
            if (card.id === `card-${cardId}`) {
                card.style.display = 'block';
                newIndex = i;
            } else {
                card.style.display = 'none';
            }
        });

        // Atualiza a barra de progresso
        progressDots.forEach((dot, i) => {
            if (i === newIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        currentCardIndex = newIndex;
    };

    // Inicia mostrando o primeiro cartão (índice 0)
    showCard(0);

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
            const nextCardId = button.dataset.card;
            
            if (currentCardIndex === 0) {
                showCard(nextCardId);
                return;
            }
            
            const currentCard = cards[currentCardIndex];
            const inputs = currentCard.querySelectorAll('[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                let hasValue = true;
                
                // Verificação específica para o select de seleção múltipla
                if (input.tagName === 'SELECT' && input.multiple) {
                    // Filtra apenas as opções selecionadas que têm um valor não-vazio
                    const selectedValidOptions = Array.from(input.options).filter(option => option.selected && option.value !== '');
                    
                    if (selectedValidOptions.length === 0) {
                        hasValue = false;
                    }
                } else if (!input.value) {
                    // Validação padrão para outros inputs (text, date, time, etc.)
                    hasValue = false;
                }

                if (!hasValue) {
                    isValid = false;
                    input.style.border = '1px solid red';
                } else {
                    input.style.border = '';
                }
            });

            if (isValid) {
                showCard(nextCardId);
            } else {
                alert('Por favor, preencha todos os campos obrigatórios.');
            }
        });
    });

    // Eventos dos botões "Anterior"
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevCardId = button.dataset.card;
            showCard(prevCardId);
        });
    });

    
    // Lógica para os botões "Sim" e "Não"
    const simNaoButtons = document.querySelectorAll('.sim-nao-btn');
    if (simNaoButtons.length > 0) {
        simNaoButtons.forEach(button => {
            button.addEventListener('click', function() {
                const resposta = this.getAttribute('data-value');
                const proximoCardId = this.getAttribute('data-next');
                
                // Encontra o card pai do botão clicado
                const currentCard = this.closest('.card');
                
                // Encontra a textarea e o input hidden dentro do card atual
                const comentarioInput = currentCard.querySelector('textarea');
                const hiddenInput = currentCard.querySelector('input[type="hidden"]');
                
                // Lógica de validação: obrigatório apenas para a resposta "Não"
                if (resposta === 'Nao') {
                    if (!comentarioInput.value.trim()) {
                        alert('Por favor, descreva o que precisa ser melhorado para poder continuar.');
                        comentarioInput.style.border = '1px solid red';
                        return; // Impede o avanço do cartão
                    } else {
                        comentarioInput.style.border = '';
                    }
                }

                // Preenche o valor do input hidden (sempre)
                if (hiddenInput) {
                    hiddenInput.value = resposta;
                }

                // Avança para o próximo card
                showCard(proximoCardId);
            });
        });
    }

    // LÓGICA PARA O BOTÃO DE GEOLOCALIZAÇÃO
    if (getLocationButton) {
        getLocationButton.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        
                        // Preenche os campos de latitude e longitude
                        latitudeInput.value = latitude;
                        longitudeInput.value = longitude;

                        // Exibe uma mensagem de carregamento enquanto busca o endereço
                        enderecoInput.value = 'Buscando endereço...';

                        // Usa uma API de geocodificação reversa para obter o endereço completo
                        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`;

                        fetch(nominatimUrl)
                            .then(response => response.json())
                            .then(data => {
                                if (data.display_name) {
                                    enderecoInput.value = data.display_name;
                                    alert('Localização obtida com sucesso!');
                                } else {
                                    // Caso a API retorne algo mas sem o nome do endereço
                                    enderecoInput.value = 'Endereço não encontrado';
                                    alert('Localização obtida, mas o endereço completo não foi encontrado.');
                                }
                            })
                            .catch(error => {
                                // Em caso de erro na requisição da API
                                console.error('Erro na API de geocodificação reversa:', error);
                                enderecoInput.value = 'Erro ao buscar o endereço';
                                alert('Não foi possível obter o endereço. Por favor, digite manualmente.');
                            });
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

    // Lógica de Autocompletar
    let autocompleteTimeout = null;
    if (enderecoInput) {
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
    }
    
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

    // LÓGICA DE ENVIO DO FORMULÁRIO
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            const formData = new FormData(form);
            const formUrl = form.action;

            fetch(formUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            })
            .then(response => {
                // Exibe a tela de sucesso personalizada (card-10)
                showCard(10);
            })
            .catch(error => {
                console.error('Erro ao enviar o formulário:', error);
                alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
            });
        });
    }

    const homeButton = document.querySelector('.home-btn');
    if (homeButton) {
        homeButton.addEventListener('click', () => {
            window.location.reload(); 
        });
    }
});