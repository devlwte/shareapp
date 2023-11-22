class Ref {
    constructor(elm) {
        const element =
            elm instanceof Element
                ? elm
                : (typeof jQuery !== 'undefined' && elm instanceof jQuery)
                    ? elm[0] // Si es una selección de jQuery, toma el primer elemento del conjunto
                    : document.querySelector(elm);

        element.value = this.generate();
    }

    generate() {
        return Ref.generateID(20);
    }

    static generateID(length, elm) {
        // Caracteres permitidos en el ID (puedes personalizar esto según tus necesidades)
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

        // Genera el ID
        let result = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }

        if (elm) {
            const element =
                elm instanceof Element
                    ? elm
                    : (typeof jQuery !== 'undefined' && elm instanceof jQuery)
                        ? elm[0] // Si es una selección de jQuery, toma el primer elemento del conjunto
                        : document.querySelector(elm);

            element.value = result;
        } else {
            return result;
        }
    }
}

class GetNames {
    constructor(){
        
    }
}

class StorageData {
    constructor(filePath) {
        // fs module
        this.fs = fs ? fs : require('fs');
        // filePath
        this.filePath = filePath;
        // Intenta cargar datos almacenados previamente
        this.data = this.load();
    }

    // Método para cargar datos desde el archivo JSON
    load() {
        try {
            if (this.fs.existsSync(this.filePath)) {
                const fileData = this.fs.readFileSync(this.filePath, 'utf-8');
                return JSON.parse(fileData);
            } else {
                // Si el archivo no existe, retorna un objeto vacío
                return {};
            }
        } catch (error) {
            // Manejar errores adecuadamente en un entorno asíncrono
            console.error('Error al cargar el archivo:', error);
            return {};
        }
    }

    // Método para obtener un valor del almacenamiento
    get(key) {
        const keys = key.split('.');
        let result = this.data;

        for (const k of keys) {
            if (result && result.hasOwnProperty(k)) {
                result = result[k];
            } else {
                return false;
            }
        }

        return result;
    }

    // Método para establecer un valor en el almacenamiento
    set(key, value) {
        const keys = key.split('.');
        let current = this.data;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!current.hasOwnProperty(k) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }

        current[keys[keys.length - 1]] = value;
        this.save();
    }

    // Método para eliminar un valor del almacenamiento
    delete(key) {
        const keys = key.split('.');
        let current = this.data;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (current && current.hasOwnProperty(k) && typeof current[k] === 'object') {
                current = current[k];
            } else {
                return; // La clave no existe, no hay nada que eliminar
            }
        }

        delete current[keys[keys.length - 1]];
        this.save();
    }

    // Método para limpiar todo el almacenamiento
    clearAll() {
        this.data = {};
        this.save();
    }

    // Método para guardar los datos en el archivo JSON
    save() {
        this.fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    }
}