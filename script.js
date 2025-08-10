// Inicializa o Quill com uma toolbar completa
const quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Escreva sua anotação aqui...',
    modules: {
        toolbar: [
            [{ 'font': [] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ]
    }
});

const saveNoteBtn = document.getElementById('save-note-btn');
const notesContainer = document.getElementById('notes-container');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const container = document.querySelector('.container');

// Elementos do Modal de Confirmação
const confirmModal = document.getElementById('confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// Paleta de cores para as anotações
const noteColors = ['color-1', 'color-2', 'color-3', 'color-4'];

// Tenta carregar as anotações do localStorage
let notes = JSON.parse(localStorage.getItem('anotacoes')) || [];
let editingIndex = null;
let indexToDelete = null;

// Renderiza todas as anotações salvas na tela
function renderNotes() {
    notesContainer.innerHTML = '';
    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        const randomColor = note.color;
        noteElement.classList.add('note', randomColor);

        const noteContent = document.createElement('div');
        noteContent.classList.add('note-content');
        noteContent.innerHTML = note.content;

        const noteActions = document.createElement('div');
        noteActions.classList.add('note-actions');
        noteActions.innerHTML = `
            <button onclick="editNote(${index})">✏️</button>
            <button onclick="showDeleteModal(${index})">❌</button>
        `;

        noteElement.appendChild(noteContent);
        noteElement.appendChild(noteActions);

        notesContainer.appendChild(noteElement);

        setTimeout(() => {
            noteElement.classList.remove('new');
        }, 10);
    });
}

// Salva as anotações no localStorage
function saveNotesToLocalStorage() {
    localStorage.setItem('anotacoes', JSON.stringify(notes));
}

// Evento de clique para salvar ou atualizar a anotação
saveNoteBtn.addEventListener('click', () => {
    const text = quill.root.innerHTML.trim();

    // AQUI ESTÁ A CORREÇÃO!
    // Verifica se há qualquer tipo de conteúdo (texto ou embed)
    if (quill.getContents().ops.some(op => op.insert)) {
        if (editingIndex !== null) {
            notes[editingIndex].content = text;
            editingIndex = null;
            saveNoteBtn.textContent = "Salvar Anotação";
        } else {
            const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];
            notes.push({ content: text, color: randomColor });
        }
        saveNotesToLocalStorage();
        quill.setContents([]);
        renderNotes();
    }
});

// Mostra o modal de confirmação
function showDeleteModal(index) {
    indexToDelete = index;
    confirmModal.classList.add('show');
}

// Oculta o modal de confirmação
function hideDeleteModal() {
    indexToDelete = null;
    confirmModal.classList.remove('show');
}

// Lógica de exclusão
confirmDeleteBtn.addEventListener('click', () => {
    if (indexToDelete !== null) {
        notes.splice(indexToDelete, 1);
        saveNotesToLocalStorage();
        renderNotes();
    }
    hideDeleteModal();
});

// Cancelar exclusão
cancelDeleteBtn.addEventListener('click', () => {
    hideDeleteModal();
});

// Edita uma anotação, carregando seu conteúdo para o editor
function editNote(index) {
    const noteContent = notes[index].content;
    quill.root.innerHTML = noteContent;
    editingIndex = index;
    saveNoteBtn.textContent = "Atualizar Anotação";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Alterna o modo de tela cheia do editor
fullscreenBtn.addEventListener('click', () => {
    document.body.classList.toggle('fullscreen-active');
    container.classList.toggle('fullscreen');
    if (container.classList.contains('fullscreen')) {
        fullscreenBtn.textContent = 'Minimizar editor';
        fullscreenBtn.title = 'Minimizar editor';
    } else {
        fullscreenBtn.textContent = '🗖';
        fullscreenBtn.title = 'Expandir editor';
    }
});

// Renderiza as notas ao carregar a página
renderNotes();