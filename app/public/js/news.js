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

kit.onDOMReady(async () => {
    // All folders
    let folders = await sendMessage("all-folders");

    Ref.generateID(30, "#ref");

    // send
    const apps = await _ajax("/php/insert", "post", {
        page: "https://mainlw.000webhostapp.com/clarityhub/php/operations.php",
        data: {
            action: 'getAllArray',
            tableName: "apps",
            data: {}
        }
    });

    console.log(apps);

    // storage
    const storage = new StorageData(path.join(folders.userData, "storagedata.json"));
    // agregar apps
    const ispage_home = kit.existsElm("#home_data");
    if (ispage_home) {
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

            console.log(aj);
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

            // Create en $form Input infoHash
            const $infoHashInput = $(`<div class='input-field col s12'>`);
            $infoHashInput.append(`<input name="ref" id='ref_${id_win}' type='text' class='validate'>`);
            $infoHashInput.append(`<label for='ref_${id_win}'>Identificador</label>`);
            $infoHashInput.find(`input`).val(Ref.generateID(30));
            $form.append($infoHashInput);

            // Create en $form Input Name
            const $nameInput = $(`<div class='input-field col s12'>`);
            $nameInput.append(`<input name="name" id='user_name${id_win}' type='text' class='validate'>`);
            $nameInput.append(`<label for='user_name${id_win}'>User Name</label>`);
            $nameInput.find(`input`).val();
            $form.append($nameInput);


            // Create en $form Input size
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

        });
    }


})