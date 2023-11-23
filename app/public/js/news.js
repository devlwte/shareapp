var gravatar = require('gravatar');

// Función para enviar mensajes al proceso principal
async function sendMessage(ipc, ...message) {
    try {
        const reply = await ipcRenderer.invoke(ipc, ...message);
        return reply;
    } catch (error) {
        console.error(error);
        return false;
    }
}

function _ajax(url, method, data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: method,
            data,
            success: (respuesta) => {
                resolve(respuesta);
            },
            error: (codigo, respuesta) => {
                reject({ codigo, respuesta });
            }
        });
    });
}


function isValidUrl(urlpath) {
    var patronURL = new RegExp(
        // valida protocolo
        '^(https?:\\/\\/)?' +
        // valida nombre de dominio
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        // valida OR direccion ip (v4)
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        // valida puerto y path
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        // valida queries
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        // valida fragment locator
        '(\\#[-a-z\\d_]*)?$', 'i');
    return !!patronURL.test(urlpath);
}

function isMail(mail) {
    switch (mail) {
        case 'gmail.com':

            return true;

        case 'hotmail.com':

            return true;

        case 'yahoo.com':

            return true;

        case 'yahoo.es':

            return true;

        default:
            return false
    }
}

// seacrh
function getElms(arrays, key, value) {
    return arrays.filter((elemento) => elemento[key] == value);
}

// set data in form
function setDataForm(item) {
    let form = $("#form_apps");

    // inputs text
    let inputs_select = form.find("input[type=text]");
    for (let a = 0; a < inputs_select.length; a++) {
        const input = inputs_select[a];
        let names = $(input);
        const selector_attr = names.attr("name");
        names.val(item[selector_attr]);
    }

    // textarea
    let textarea_select = form.find("textarea");
    for (let t = 0; t < textarea_select.length; t++) {
        const ts = textarea_select[t];
        let names = $(ts);
        const selector_attr = names.attr("name");
        names.val(item[selector_attr]);
    }

    // inputs checkbox
    let checkbox_select = form.find("input[type=checkbox]");
    for (let ch = 0; ch < checkbox_select.length; ch++) {
        const check = checkbox_select[ch];
        let names = $(check);
        const selector_attr = names.attr("name");
        if (item[selector_attr]) {
            names.attr("checked", "");
        } else {
            names.removeAttr("checked");
        }
    }

    // UPDATE FORM
    M.updateTextFields();
    M.textareaAutoResize($("textarea"));
}

kit.onDOMReady(async () => {
    // All folders
    let folders = await sendMessage("all-folders");

    // storage
    const storage = new StorageData(path.join(folders.userData, "storagedata.json"));

    // agregar apps
    const ispage_home = kit.existsElm("#home_data");
    if (ispage_home) {
        Ref.generateID(30, "#ref");
        $("#public").on("click", async function (e) {
            e.preventDefault();
            let dataform = $("#form_apps").serialize();
            let datas = kit.searchParams("?" + dataform);

            // is home
            let ishome = datas.ishome ? datas.ishome === "on" : false;

            datas.ishome = ishome;

            // verificar que ningun campo este vacio
            for (const val of Object.keys(datas)) {
                if (val !== "ishome") {
                    const inputElement = $("#form_apps").find("input[name='" + val + "'], textarea[name='" + val + "']");
                    if (inputElement.length > 0) {
                        const inputValue = inputElement.val().trim();
                        if (inputValue === "") {
                            const id_input = inputElement.attr("id");
                            const label = $("#form_apps").find("label[for='" + id_input + "']");
                            M.toast({ html: `Error complete el campo '${label.text()}'`, classes: 'rounded orange darken-4' });
                            return;
                        }
                    }
                }
            }

            // add user ref
            datas.dev = storage.get("user.ref");

            // send
            const aj = await _ajax("/php/insert", "post", {
                page: "https://mainlw.000webhostapp.com/clarityhub/php/operations.php",
                data: {
                    action: 'insertData',
                    tableName: "apps",
                    data: {
                        ...datas
                    }
                }
            });

            if (aj) {

            } else {
                M.toast({ html: `Falló. Puede ser un problema de conexión.`, classes: 'rounded orange darken-4' });
            }

        });
    }

    // agregar apps
    const ispage_update = kit.existsElm("#update_data");
    if (ispage_update) {
        // get apps
        const apps = await _ajax("/php/insert", "post", {
            page: "https://mainlw.000webhostapp.com/clarityhub/php/operations.php",
            data: {
                action: 'getAllArray',
                tableName: "apps",
                data: {}
            }
        });

        if (apps) {

            // get apps by dev
            let appsSelect = getElms(apps.message, "dev", storage.get("user.ref"));
            $(".list_apps").empty();
            for (let i = 0; i < appsSelect.length; i++) {
                const ap = appsSelect[i];

                // create
                const $elm = $(`<div class="app_user">
                                <div class="icono_app"></div>
                                <div class="data_app">
                                <div class="name_app">
                                    TorrentHive
                                </div>
                                <div class="version_app">
                                    1.0.0
                                </div>
                                </div>
                            </div>`);

                // add
                $elm.find(".icono_app").css({ backgroundImage: `url('${ap.cover}')` });
                $elm.find(".name_app").text(ap.title);
                $elm.find(".version_app").text(ap.version);

                // click
                $($elm).on("click", function () {
                    setDataForm(ap);
                });


                $(".list_apps").append($elm);
            }
        } else {
            M.toast({ html: `Falló. Puede ser un problema de conexión.`, classes: 'rounded orange darken-4' });
        }

        // save
        $("#public").on("click", async function (e) {
            e.preventDefault();
            let dataform = $("#form_apps").serialize();
            let datas = kit.searchParams("?" + dataform);

            // is home
            let ishome = datas.ishome ? datas.ishome === "on" : false;

            datas.ishome = ishome;

            // verificar que ningun campo este vacio
            for (const val of Object.keys(datas)) {
                if (val !== "ishome") {
                    const inputElement = $("#form_apps").find("input[name='" + val + "'], textarea[name='" + val + "']");
                    if (inputElement.length > 0) {
                        const inputValue = inputElement.val().trim();
                        if (inputValue === "") {
                            const id_input = inputElement.attr("id");
                            const label = $("#form_apps").find("label[for='" + id_input + "']");
                            M.toast({ html: `Error complete el campo '${label.text()}'`, classes: 'rounded orange darken-4' });
                            return;
                        }
                    }
                }
            }

            // add user ref
            datas.dev = storage.get("user.ref");

            // get list
            const update_reg = await _ajax("/php/insert", "post", {
                page: "https://mainlw.000webhostapp.com/clarityhub/php/operations.php",
                data: {
                    action: 'idseguro',
                    idseguro: storage.get("user.idseguro"),
                    correo: storage.get("user.correo"),
                    dev: storage.get("user.ref"),
                    data: {
                        ...datas
                    }
                }
            });

            if (update_reg.title === "exito") {
                M.toast({ html: `Datos Actualizados`, classes: 'rounded green' });
            }
        });
    }

    // verificar si hay un usuario
    if (!storage.get("user")) {

        let userdata = null;
        userdata = new BrowserWin({
            id: "userreg",
            title: "Usuario",
            width: 913,
            height: 522,
            state: true,
            reload: true
        });

        userdata.on("finish-load", async (win) => {
            let body = win.find(".browser_tbody");
            body.css({ "background-color": "#eee", overflow: "auto" });
            body.empty();

            // formulario
            const $form = $("<form class='row' spellcheck='false' id='form_user'>");

            // id
            const id_win = win.attr("id");

            // Create en $form Input
            const $infoHashInput = $(`<div class='input-field col s12'>`);
            $infoHashInput.append(`<input name="ref" id='ref_${id_win}' type='text' class='validate'>`);
            $infoHashInput.append(`<label for='ref_${id_win}'>Identificador</label>`);
            $infoHashInput.find(`input`).val(Ref.generateID(30));
            $form.append($infoHashInput);

            // Create en $form Input
            const $nameInput = $(`<div class='input-field col s12'>`);
            $nameInput.append(`<input name="name" id='user_name${id_win}' type='text' class='validate'>`);
            $nameInput.append(`<label for='user_name${id_win}'>User Name</label>`);
            $nameInput.find(`input`).val();
            $form.append($nameInput);


            // Create en $form Input
            const $sizeInput = $(`<div class='input-field col s6'>`);
            $sizeInput.append(`<input name="correo" id='correo_${id_win}' type='text' class='validate'>`);
            $sizeInput.append(`<label for='correo_${id_win}'>Gmail</label>`);
            $sizeInput.find(`input`).val();
            $form.append($sizeInput);

            // Gravatar
            // var secureUrl = gravatar.url('lwte.dev@gmail.com', {s: '100', r: 'x', d: 'retro'}, true);
            const $gravatarInput = $(`<div class='input-field col s6'>`);
            $gravatarInput.append(`<input name="icono" id='gravatar_${id_win}' type='text' class='validate'>`);
            $gravatarInput.append(`<label for='gravatar_${id_win}'>Gravatar</label>`);
            $form.append($gravatarInput);

            // Create en $form Input
            const $claveInput = $(`<div class='input-field col s12'>`);
            $claveInput.append(`<input name="idseguro" id='clave_${id_win}' type='text' class='validate'>`);
            $claveInput.append(`<label for='clave_${id_win}'>Clave Segura</label>`);
            $claveInput.find(`input`).val(Ref.generateIDs(35));
            $form.append($claveInput);

            // container
            const $container_fuild = $("<div class='container-hab'>");

            // is show gravatar
            let isShowGravatar = false;
            $($form).on("change", function (e) {
                e.preventDefault();
                var values = $("#form_user").serialize();
                let datas = kit.searchParams("?" + values);

                // verifiar correo
                let data_correo = datas.correo.split("@");
                if (data_correo[1]) {
                    if (data_correo[1] == "gmail.com" || data_correo[1] == "hotmail.com" || data_correo[1] == "yahoo.com" || data_correo[1] == "yahoo.es") {
                        if (!isShowGravatar) {
                            var secureUrl = gravatar.url(data_correo, { s: '100', r: 'x', d: 'retro' }, true);
                            $gravatarInput.find(`input`).val(secureUrl);
                            M.updateTextFields();
                            isShowGravatar = true;
                        }

                    }
                }


            });

            $container_fuild.append($form);

            // añadir formulario en el body
            body.append($container_fuild);

            M.updateTextFields();
        })

        userdata.pauseclose = true;
        userdata.on("close", async (e) => {
            let isClose = false;
            var values = $("#form_user").serialize();
            let datas = kit.searchParams("?" + values);

            // verificar los campos
            for (const val of Object.keys(datas)) {
                if (datas[val] == "") {
                    const plac = $("#form_user").find("input[name='" + val + "']");
                    const id_input = plac.attr("id");
                    const label = $("#form_user").find("label[for='" + id_input + "']");
                    M.toast({ html: `Error complete el ${label.text()}`, classes: 'rounded orange darken-4' });
                    return
                }
            }

            // verifiar correo
            let data_correo = datas.correo.split("@");
            if (data_correo[1]) {

                const ismail = isMail(data_correo[1]);
                if (!ismail) {
                    M.toast({ html: `Error usa un correo valido`, classes: 'rounded orange darken-4' });
                    return;
                }

            } else {
                M.toast({ html: `Error usa un correo valido`, classes: 'rounded orange darken-4' });
                return;
            }

            // verificar url gravatar
            if (!isValidUrl(datas.icono)) {
                M.toast({ html: `Error usa una url valida en Gravatar`, classes: 'rounded orange darken-4' });
                return;
            }





            // send
            const aj = await _ajax("/php/insert", "post", {
                page: "https://mainlw.000webhostapp.com/clarityhub/php/operations.php",
                data: {
                    action: 'insertData',
                    tableName: "users",
                    data: {
                        ...datas
                    }
                }
            });

            if (aj) {
                if (aj.title === "exito") {
                    // save
                    storage.set("user", datas);
                    // close
                    userdata.closeBrowserIsPaused();
                    userdata = null;

                    M.toast({ html: aj.message, classes: 'rounded orange darken-4' });
                } else {
                    M.toast({ html: aj.message, classes: 'rounded orange darken-4' });
                    userdata.closeBrowserIsCancelled();
                }
            }



        });
    }


})