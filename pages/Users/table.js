//--------------------------------------Variables----------------------------------
const user = "JUANITO";
const date = new Date(Date.now()).toISOString().split('T')[0];

const header = document.querySelector('header');
const formulario = document.querySelector('#formulario');

const tipoUsuarioInput = document.querySelector('#usuario');
const nombreInput = document.querySelector('#nombre');
const apellidoPaternoInput = document.querySelector('#paterno');
const apellidoMaternoInput = document.querySelector('#materno');
const correoInput = document.querySelector('#correo');
const celularInput = document.querySelector('#celular');
const notasInput = document.querySelector('#notas');

const submitButton = document.querySelector('#submit');
const openButton = document.querySelector('#add-user-button');
const cancelButton = document.querySelector('.cancel-button');

const editor = document.querySelector('.editor');
const editorBackdrop = document.querySelector('.editor-backdrop');
const sentScreen = document.querySelector('.sent-screen');
const exitButton = document.querySelector('#exit-button');
const createButton = document.querySelector('#create-new');

//users-table
const idUsersTable = '#users-table';
const notFoundUsers = document.querySelector('#users-table .not-found');
const tbodyUsers = document.querySelector('#users-table tbody');
const nextButtonUsers = document.querySelector('#users-table .next');
const prevButtonUsers = document.querySelector('#users-table .prev');
const buttonsContainerUsers = document.querySelector('#users-table .pagination');
const paginationContainerUsers = document.querySelector('#users-table .pagination-container');

let isEditing = false;
let editingID = null;
const MAX_ROWS = 5;

//-----------------------------------Eventos-------------------------------------------
formulario.addEventListener('submit', (e) => submitUsuario(e));

tipoUsuarioInput.addEventListener('input', toggleFormButtons);
nombreInput.addEventListener('input', toggleFormButtons);
apellidoPaternoInput.addEventListener('input', toggleFormButtons);
apellidoMaternoInput.addEventListener('input', toggleFormButtons);
correoInput.addEventListener('input', toggleFormButtons);
celularInput.addEventListener('input', toggleFormButtons);

openButton.addEventListener('click', openForm);
cancelButton.addEventListener('click', cancelForm);
exitButton.addEventListener('click', cancelForm);

createButton.addEventListener('click', () => sentScreen.style.display = 'none');
editorBackdrop.addEventListener('click', cancelForm);

document.addEventListener("DOMContentLoaded", () => {
    TestUsers();
    filterUsers('');

    ui.display();
    ui.updatePaginationButtons();
});

//--------------------------------------Clases---------------------------------------
class Notificacion {

    constructor(mensaje) {
        this.dialog = document.querySelector('#dialog');
        this.icon = document.querySelector('#modal-icon');
        this.title = document.querySelector('.modal-text');
        this.leftButton = document.querySelector('#close-button')
        this.rightButton = document.querySelector('#action-button')
        this.mensaje = mensaje;

        let selection;
        if (mensaje === "eliminar") selection = this.content[0];
        else if (mensaje === "cancelar") selection = this.content[1];
        else {
            sentScreen.style.display = 'flex';
            return;
        }

        this.icon.src = selection.icon;
        this.icon.altIcon = selection.altIcon
        this.title.textContent = selection.title;
        this.leftButton.textContent = selection.leftButton;
        this.rightButton.textContent = selection.rightButton;
        this.rightButton.style.backgroundColor = selection.actionBgColor;

        if (selection.actionButton === 'right') {
            this.rightButton.classList.add('trigger-modal-action');
            this.leftButton.classList.add('close-modal-action');

            this.rightButton.classList.remove('close-modal-action');
            this.leftButton.classList.remove('trigger-modal-action');
        }
        else if (selection.actionButton === 'left') {
            this.rightButton.classList.add('close-modal-action');
            this.leftButton.classList.add('trigger-modal-action');

            this.rightButton.classList.remove('trigger-modal-action');
            this.leftButton.classList.remove('close-modal-action');
        }
    }

    content = [{
        id: 1,
        icon: "../../assets/trash.svg",
        altIcon: "Bote de basura",
        title: "Confirma que deseas eliminar este elemento",
        rightButton: "Eliminar",
        leftButton: "Cancelar",
        actionBgColor: "#F3404A",
        actionButton: 'right'

    },
    {
        id: 2,
        icon: "../../assets/warning-icon.svg",
        altIcon: "Advertencia",
        title: "Estás a punto de salir sin haber guardado los cambios realizados ¿Deseas continuar?",
        rightButton: "Volver",
        leftButton: "Salir",
        actionBgColor: "#0D519B",
        actionButton: 'left'

    }]

    showModal() {
        return new Promise((resolve) => {
            this.dialog.showModal();

            const actionButton = document.querySelector('.trigger-modal-action');
            const closeButton = document.querySelector('.close-modal-action');

            actionButton.addEventListener('click', () => {
                this.dialog.close();
                resolve(true);
            });
            closeButton.addEventListener('click', () => {
                this.dialog.close();
                resolve(false);
            });

            this.dialog.addEventListener('click', (e) => {
                const rect = this.dialog.getBoundingClientRect();
                const isInDialog =
                    rect.top <= e.clientY &&
                    e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX &&
                    e.clientX <= rect.left + rect.width;

                if (!isInDialog) {
                    this.dialog.close();
                    resolve(false);
                }
            });
        });
    }
}
class Usuario {
    constructor(id) {
        this.id = id;
        this.tipoUsuario = tipoUsuarioInput.value;
        this.nombre = nombreInput.value;
        this.paterno = apellidoPaternoInput.value;
        this.materno = apellidoMaternoInput.value;
        this.correo = correoInput.value;
        this.celular = celularInput.value;
        this.notas = notasInput.value;

        this.metadata = {
            autor: user,
            fecha: date,
        }
    }
}
class Usuarios {
    constructor() {
        this.usuarios = [];
    }
    create(usuario) {
        this.usuarios.push(usuario);
    }
    edit(newUsuario) {
        this.usuarios = this.usuarios.map(usuario => usuario.id === newUsuario.id ? newUsuario : usuario);
    }
    delete(id) {
        this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
    }
    length() {
        return this.usuarios.length;
    }
    slice(start, end) {
        return this.usuarios.slice(start, end);
    }
}
class TableUI {
    constructor(id, tbody, notFound, paginationContainer, buttonsContainerUsers, nextButton, prevButton, usuarios) {
        this.id = id;

        this.buttonsContainerUsers = buttonsContainerUsers;
        this.paginationContainer = paginationContainer;

        this.tbody = tbody;
        this.notFound = notFound;

        this.nextButton = nextButton;
        this.prevButton = prevButton;

        this.usuarios = usuarios;
        this.currentPage = 1;

        this.eventListeners();
    }

    eventListeners() {
        this.nextButton.onclick = () => this.updateCurrentPage("next");
        this.prevButton.onclick = () => this.updateCurrentPage("prev");
    }

    updateTable() {
        const start = (this.currentPage - 1) * MAX_ROWS;
        const end = start + MAX_ROWS;

        const sortedUsuarios = this.usuarios
            .sort((a, b) => new Date(b.metadata.fecha) - new Date(a.metadata.fecha));
        const paginatedUsuarios = sortedUsuarios.slice(start, end);


        this.tbody.innerHTML = '';

        paginatedUsuarios.forEach(usuario => this.insertRow(usuario));
    }

    insertRow(usuario) {
        const tr = document.createElement('tr');
        const { metadata } = usuario;

        const nombre = document.createElement('td');
        const tipoUsuario = document.createElement('td');
        const fecha = document.createElement('td');
        const correo = document.createElement('td');
        const notas = document.createElement('td');
        const acciones = document.createElement('td');

        nombre.textContent = usuario.nombre;
        tipoUsuario.textContent = usuario.tipoUsuario;
        fecha.textContent = metadata.fecha;
        correo.textContent = usuario.correo;
        notas.textContent = usuario.notas;

        tr.appendChild(nombre);
        tr.appendChild(tipoUsuario);
        tr.appendChild(fecha);
        tr.appendChild(correo);
        tr.appendChild(notas);

        const editar = document.createElement('button');
        const elimimar = document.createElement('button');

        editar.classList.add('edit');
        elimimar.classList.add('delete');

        editar.innerHTML = `<img src="../../assets/edit.svg" alt="edit">`;
        elimimar.innerHTML = `<img src="../../assets/delete.svg" alt="delete">`;

        editar.onclick = () => { editUsuario(usuario); };
        elimimar.onclick = () => { eliminarUsuario(usuario); };

        acciones.classList.add('actions');
        acciones.appendChild(editar);
        acciones.appendChild(elimimar);

        tr.appendChild(acciones);
        this.tbody.appendChild(tr);
    }

    updatePagination() {
        const rows = this.tbody.getElementsByTagName('tr').length;
        const buttons = document.querySelectorAll(`${this.id}  .pagination button`)
        const totalButtons = buttons.length;
        const totalUsuarios = this.usuarios.length;

        totalUsuarios <= MAX_ROWS ?
            this.paginationContainer.style.display = 'none' :
            this.paginationContainer.style.display = 'flex';

        //Agregar botones
        if (totalUsuarios > (totalButtons * MAX_ROWS) && rows <= MAX_ROWS) {
            const newButton = document.createElement('button');
            newButton.classList.add('btn');
            newButton.textContent = totalButtons + 1;

            this.buttonsContainerUsers.appendChild(newButton);
            this.updatePaginationButtons();
        }
        //Eliminar botones
        if (totalUsuarios <= (totalButtons - 1) * MAX_ROWS) {
            this.buttonsContainerUsers.removeChild(buttons[totalButtons - 1]);
            this.updatePaginationButtons();
        }
    }

    updatePaginationButtons() {
        const paginationButtons = document.querySelectorAll(`${this.id} .pagination button`);

        paginationButtons.forEach(button => {
            let currentButtonPage = parseInt(button.textContent);
            currentButtonPage === this.currentPage ? button.classList.add('active') : button.classList.remove('active')

            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.textContent);
                paginationButtons.forEach(btn => { btn.classList.remove('active'); });
                button.classList.add('active');
                this.updateTable();
            });
        });
    }

    updateCurrentPage(action) {
        const paginationButtons = document.querySelectorAll(`${this.id} .pagination button`);

        if (action === "next") this.currentPage = Math.min(this.currentPage + 1, paginationButtons.length);
        else this.currentPage = Math.max(this.currentPage - 1, 1);

        this.updateTable();
        this.updatePaginationButtons();
    }

    display() {
        this.updateTable();
        this.updatePagination();

        this.usuarios.length > 0 ?
            this.notFound.style.display = 'none' :
            this.notFound.style.display = 'flex';
    }

}

const usuarios = new Usuarios()
const ui = new TableUI(idUsersTable, tbodyUsers, notFoundUsers, paginationContainerUsers, buttonsContainerUsers, nextButtonUsers, prevButtonUsers, usuarios.usuarios);


//--------------------------------------Funciones---------------------------------------
function submitUsuario(e) {
    e.preventDefault();
    let usuario;

    if (isEditing) {
        usuario = new Usuario(editingID);
        usuarios.edit(usuario);

        ui.usuarios = usuarios.usuarios;
        ui.display();

        filterUsers();
        uiSearch.display();

        new Notificacion("exito");
    } else {
        usuario = new Usuario(generateID());
        usuarios.create(usuario);

        ui.usuarios = usuarios.usuarios;
        ui.display();

        filterUsers();
        uiSearch.display();

        new Notificacion("exito");
    }

    isEditing = false;
    editingID = null;
    formulario.reset();
    toggleFormButtons();
}

async function eliminarUsuario(usuario) {
    const confirmation = await new Notificacion("eliminar").showModal();

    if (confirmation) {
        usuarios.delete(usuario.id);

        ui.usuarios = usuarios.usuarios;
        // Actualizar la página actual si se elimina el último elemento
        ui.currentPage = usuarios.length() % MAX_ROWS === 0 ? Math.max(ui.currentPage - 1, 1) : ui.currentPage;
        ui.display();

        filterUsers();
        uiSearch.display();

        isEditing = false;
        editingID = null;
    }
}

function editUsuario(usuario) {
    isEditing = true;
    editingID = usuario.id;

    tipoUsuarioInput.value = usuario.tipoUsuario;
    nombreInput.value = usuario.nombre;
    apellidoPaternoInput.value = usuario.paterno;
    apellidoMaternoInput.value = usuario.materno;
    correoInput.value = usuario.correo;
    celularInput.value = usuario.celular;
    notasInput.value = usuario.notas;
    openForm();
}

function openForm() {
    toggleFormButtons();
    editorBackdrop.classList.add("open");
    editor.classList.add("open-editor");
    sentScreen.style.display = 'none';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

async function cancelForm() {

    if (!isFormFilled()) {
        editorBackdrop.classList.remove("open");
        editor.classList.remove("open-editor");
        formulario.reset();
        return;
    }

    const confirmation = await new Notificacion("cancelar").showModal();

    if (confirmation) {
        editorBackdrop.classList.remove("open");
        editor.classList.remove("open-editor");
        formulario.reset();
    }

}

function toggleFormButtons() {
    submitButton.disabled = !isFormFilled();
}

function generateID() {
    return Date.now().toString();
}

function isFormFilled() {
    return (
        tipoUsuarioInput.value.trim() !== "" &&
        nombreInput.value.trim() !== "" &&
        apellidoPaternoInput.value.trim() !== "" &&
        apellidoMaternoInput.value.trim() !== "" &&
        correoInput.value.trim() !== "" &&
        celularInput.value.trim() !== ""
    );
}


//---------------------------------Search Users---------------------------------------
const searchUsersInput = document.querySelector('#search-users-input');

const idSearchResults = '#search-results';
const resultsContainer = document.querySelector('#search-results');
const tbodySearch = document.querySelector('#search-results tbody');
const nextButtonSearch = document.querySelector('#search-results .next');
const prevButtonSearch = document.querySelector('#search-results .prev');
const paginationContainerSearch = document.querySelector('#search-results .pagination-container');
const buttonsContainerSearch = document.querySelector('#search-results .pagination');
const notFoundSearch = document.querySelector('#search-results .not-found');

const uiSearch = new TableUI(
    idSearchResults,
    tbodySearch,
    notFoundSearch,
    paginationContainerSearch,
    buttonsContainerSearch,
    nextButtonSearch,
    prevButtonSearch,
    []
);

searchUsersInput.addEventListener('input', filterUsers);

function filterUsers() {
    uiSearch.currentPage = 1;
    const searchText = searchUsersInput.value.trim().toLowerCase();

    if (searchText === "") {
        resultsContainer.style.display = 'none';
    } else {
        resultsContainer.style.display = 'block';
        uiSearch.usuarios = usuarios.usuarios.filter(usuario =>
            usuario.nombre.toLowerCase().includes(searchText)
        );
        uiSearch.display();
    }
}

function TestUsers() {
    const test = [
        {
            id: 1,
            tipoUsuario: "Profesores",
            nombre: "Juan",
            paterno: "Juarez",
            materno: "Perez",
            correo: "correo@correo",
            celular: "123",
            notas: "Descripcion",
            metadata: {
                autor: "JUANITO",
                fecha: "2025-01-29"
            }
        },
        {
            id: 2,
            tipoUsuario: "Estudiantes",
            nombre: "Pedro",
            paterno: "Lopez",
            materno: "Gonzalez",
            correo: "correo@correo",
            celular: "123",
            notas: "Hola",
            metadata: {
                autor: "JUANITO",
                fecha: "2025-03-29"
            }
        },
        {
            id: 3,
            tipoUsuario: "Administradores",
            nombre: "Maria",
            paterno: "Hernandez",
            materno: "Martinez",
            correo: "correo@correo",
            celular: "123",
            notas: "Hola",
            metadata: {
                autor: "JUANITO",
                fecha: "2024-04-29"
            }
        },
        {
            id: 4,
            tipoUsuario: "Profesores",
            nombre: "Ana",
            paterno: "Gonzalez",
            materno: "Lopez",
            correo: "correo@correo",
            celular: "123",
            notas: "Hola",
            metadata: {
                autor: "JUANITO",
                fecha: "2025-04-10"
            }
        },
        {
            id: 5,
            tipoUsuario: "Estudiantes",
            nombre: "Luis",
            paterno: "Martinez",
            materno: "Hernandez",
            correo: "correo@correo",
            celular: "123",
            notas: "Hola",
            metadata: {
                autor: "JUANITO",
                fecha: "2025-01-29"
            }
        },
        {
            id: 6,
            tipoUsuario: "Administradores",
            nombre: "Laura",
            paterno: "Lopez",
            materno: "Gonzalez",
            correo: "correo@correo",
            celular: "123",
            notas: "Hola",
            metadata: {
                autor: "JUANITO",
                fecha: "2025-01-29"
            }
        },
        {
            id: 7,
            tipoUsuario: "Profesores",
            nombre: "Carlos",
            paterno: "Hernandez",
            materno: "Martinez",
            correo: "correo@correo",
            celular: "123",
            notas: "Hola",
            metadata: {
                autor: "JUANITO",
                fecha: "2025-01-29"
            }
        },
        {
            id: 8,
            tipoUsuario: "Estudiantes",
            nombre: "Sofia",
            paterno: "Gonzalez",
            materno: "Lopez",
            correo: "correo@correo",
            celular: "123",
            notas: "Hola",
            metadata: {
                autor: "JUANITO",
                fecha: "2025-01-29"
            }
        }
    ]
    test.forEach(usuario => {
        const newUsuario = new Usuario(usuario.id);
        newUsuario.tipoUsuario = usuario.tipoUsuario;
        newUsuario.nombre = usuario.nombre;
        newUsuario.paterno = usuario.paterno;
        newUsuario.materno = usuario.materno;
        newUsuario.correo = usuario.correo;
        newUsuario.celular = usuario.celular;
        newUsuario.notas = usuario.notas;
        newUsuario.metadata = usuario.metadata;

        usuarios.create(newUsuario);
    });
}
