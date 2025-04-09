//--------------------------------------Variables----------------------------------
const user = "JUANITO";
const date = new Date(Date.now()).toISOString().split('T')[0];

const header = document.querySelector('header');
const formulario = document.querySelector('#formulario');
const audienciaInput = document.querySelector('#audience');
const tituloInput = document.querySelector('#title');
const mensajeInput = document.querySelector('#message');

const submitButton = document.querySelector('#submit');
const saveButton = document.querySelector('.upper-button');
const openButton = document.querySelector('.square');
const cancelButton = document.querySelector('.cancel-button');

const editor = document.querySelector('.editor');
const editorBackdrop = document.querySelector('.editor-backdrop');
const sentScreen = document.querySelector('.sent-screen');
const exitButton = document.querySelector('#exit-button');
const createButton = document.querySelector('#create-new');

const tbody = document.querySelector('table tbody');
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');
const contenedorBotones = document.querySelector('.pagination');

let currentPage = 1;
let isEditing = false;
let editingID = null;
const MAX_ROWS = 5;

//-----------------------------------Eventos-------------------------------------------
formulario.addEventListener('submit', (e) => submitAnuncio(e, "ENVIADO"));
saveButton.addEventListener('click', (e) => submitAnuncio(e, "BORRADOR"));

openButton.addEventListener('click', openForm);
cancelButton.addEventListener('click', cancelForm);
exitButton.addEventListener('click', cancelForm);

nextButton.addEventListener('click', () => updateCurrentPage("next"));
prevButton.addEventListener('click', () => updateCurrentPage("prev"));

createButton.addEventListener('click', () => sentScreen.style.display = 'none');

document.addEventListener("DOMContentLoaded", () => {
    ui.display();
    ui.updatePaginationButtons();
});

//--------------------------------------Clases---------------------------------------
class Notificacion {

    constructor(mensaje) {
        this.dialog = document.querySelector('#dialog');
        this.icon = document.querySelector('#modal-icon');
        this.title = document.querySelector('.modal-text');
        this.closeButton = document.querySelector('#close-button')
        this.actionButton = document.querySelector('#action-button')
        this.mensaje = mensaje;

        let selection
        if (mensaje === "eliminar") selection = this.content[0];
        else if (mensaje === "cancelar") selection = this.content[1];
        else {
            sentScreen.style.display = 'flex';
            return;
        }

        this.icon.src = selection.icon;
        this.icon.altIcon = selection.altIcon
        this.title.textContent = selection.title;
        this.closeButton.textContent = selection.closeButton;
        this.actionButton.textContent = selection.actionButton;
        this.actionButton.style.backgroundColor = selection.actionBgColor;
    }

    content = [{
        id: 1,
        icon: "../../assets/trash.svg",
        altIcon: "Bote de basura",
        title: "Confirma que deseas eliminar este elemento",
        actionButton: "Eliminar",
        closeButton: "Cancelar",
        actionBgColor: "#F3404A"

    },
    {
        id: 2,
        icon: "../../assets/warning-icon.svg",
        altIcon: "Advertencia",
        title: "Estás a punto de salir sin haber guardado los cambios realizados ¿Deseas continuar?",
        actionButton: "Volver",
        closeButton: "Salir",
        actionBgColor: "#0D519B"

    }]

    showModal() {
        return new Promise((resolve) => {
            this.dialog.showModal();

            this.actionButton.onclick = () => {
                this.dialog.close();
                resolve(true);
            };

            this.closeButton.onclick = () => {
                this.dialog.close();
                resolve(false);
            };

            // Cerrar al hacer clic fuera del modal
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
class Anuncio {
    constructor(id, estatus) {
        this.id = id;
        this.audiencia = audienciaInput.value;
        this.titulo = tituloInput.value;
        this.mensaje = mensajeInput.value;
        this.metadata = {
            autor: user,
            fecha: date,
            estatus: estatus,
        }
    }
}
class Anuncios {
    constructor() {
        this.anuncios = [];
    }
    create(anuncio) {
        this.anuncios.push(anuncio);
        console.log(this.anuncios);
    }
    edit(newAnuncio) {
        this.anuncios = this.anuncios.map(anuncio => anuncio.id === newAnuncio.id ? newAnuncio : anuncio);
        console.log(this.anuncios);
    }
    delete(id) {
        this.anuncios = this.anuncios.filter(anuncio => anuncio.id !== id);
        console.log(this.anuncios);
    }
    length() {
        return this.anuncios.length;
    }
    slice(start, end) {
        return this.anuncios.slice(start, end);
    }
}
class UI {
    updateTable() {
        const start = (currentPage - 1) * MAX_ROWS;
        const end = start + MAX_ROWS;
        const paginatedAnuncios = anuncios.slice(start, end);
        tbody.innerHTML = '';

        paginatedAnuncios.forEach(anuncio => this.insertRow(anuncio));
    }

    insertRow(anuncio) {
        const tr = document.createElement('tr');
        const { metadata } = anuncio;

        const titulo = document.createElement('td');
        const autor = document.createElement('td');
        const fecha = document.createElement('td');
        const estatus = document.createElement('td');
        const acciones = document.createElement('td');

        titulo.textContent = anuncio.titulo;
        autor.textContent = metadata.autor;
        fecha.textContent = metadata.fecha;
        estatus.textContent = metadata.estatus;

        tr.appendChild(titulo);
        tr.appendChild(autor);
        tr.appendChild(fecha);
        tr.appendChild(estatus);
        tr.appendChild(acciones);

        if (metadata.estatus === "BORRADOR") {
            const editar = document.createElement('button');
            const elimimar = document.createElement('button');

            editar.classList.add('edit');
            elimimar.classList.add('delete');

            editar.innerHTML = `<img src="../../assets/edit.svg" alt="edit">`;
            elimimar.innerHTML = `<img src="../../assets/delete.svg" alt="delete">`;

            editar.onclick = () => { editarAnuncio(anuncio); };
            elimimar.onclick = () => { eliminarAnuncio(anuncio); };

            acciones.classList.add('actions');
            acciones.appendChild(editar);
            acciones.appendChild(elimimar);
        }
        tr.appendChild(acciones);
        tbody.appendChild(tr);
    }

    updatePagination() {
        const rows = tbody.getElementsByTagName('tr').length;
        const buttons = document.querySelectorAll('.pagination button');
        const totalButtons = buttons.length;
        const totalAnuncios = anuncios.length();

        //Agregar botones
        if (totalAnuncios > (totalButtons * MAX_ROWS) && rows <= MAX_ROWS) {
            const nuevoBoton = document.createElement('button');
            nuevoBoton.classList.add('btn');
            nuevoBoton.textContent = totalButtons + 1;

            contenedorBotones.appendChild(nuevoBoton);
            this.updatePaginationButtons();
        }
        //Eliminar botones
        if (totalAnuncios <= (totalButtons - 1) * MAX_ROWS) {
            contenedorBotones.removeChild(buttons[totalButtons - 1]);
            this.updatePaginationButtons();
        }
    }

    updatePaginationButtons() {
        const paginationButtons = document.querySelectorAll('.pagination button');

        paginationButtons.forEach(button => {
            let currentButtonPage = parseInt(button.textContent);
            currentButtonPage === currentPage ? button.classList.add('active') : button.classList.remove('active')

            button.addEventListener('click', () => {
                currentPage = parseInt(button.textContent);
                paginationButtons.forEach(btn => { btn.classList.remove('active'); });
                button.classList.add('active');
                this.updateTable();
            });
        });
    }

    display() {
        this.updateTable();
        this.updatePagination();
    }

}

const anuncios = new Anuncios()
const ui = new UI()

//--------------------------------------Funciones---------------------------------------
function submitAnuncio(e, estatus) {
    e.preventDefault();
    let anuncio;

    if (isEditing) {
        anuncio = new Anuncio(editingID, estatus);
        anuncios.edit(anuncio);
        ui.display();
        new Notificacion("exito");
    } else {
        anuncio = new Anuncio(generarID(), estatus);
        anuncios.create(anuncio);
        ui.display();
        new Notificacion("exito");
    }

    isEditing = false;
    editingID = null;
    formulario.reset();
}

function updateCurrentPage(action) {
    const paginationButtons = document.querySelectorAll('.pagination button').length;

    if (action === "next") currentPage = Math.min(currentPage + 1, paginationButtons);
    else currentPage = Math.max(currentPage - 1, 1);

    ui.updateTable();
    ui.updatePaginationButtons();
}

async function eliminarAnuncio(anuncio) {
    const confirmacion = await new Notificacion("eliminar").showModal();

    if (confirmacion) {
        anuncios.delete(anuncio.id);
        // Actualizar la página actual si se elimina el último elemento
        currentPage = anuncios.length() % MAX_ROWS === 0 ? Math.max(currentPage - 1, 1) : currentPage;

        ui.display();
        isEditing = false;
        editingID = null;
        console.log(confirmacion);
    } else {
        console.log("Eliminación cancelada");
    }
}

function editarAnuncio(anuncio) {
    isEditing = true;
    editingID = anuncio.id;

    audienciaInput.value = anuncio.audiencia;
    tituloInput.value = anuncio.titulo;
    mensajeInput.value = anuncio.mensaje;
    openForm();
}

function openForm() {
    editorBackdrop.classList.add("open");
    editor.classList.add("open-editor");
    sentScreen.style.display = 'none';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    // body.style.overflow = "hidden";
}

async function cancelForm() {
    if (!isEditing) {
        editorBackdrop.classList.remove("open");
        editor.classList.remove("open-editor");
        formulario.reset();
        return;
    }

    const confirmacion = await new Notificacion("cancelar").showModal();

    if (confirmacion) {
        console.log("cancelacion cancelada");
    } else {
        editorBackdrop.classList.remove("open");
        editor.classList.remove("open-editor");
        formulario.reset();
    }

}

function generarID() {
    return Date.now().toString();
}