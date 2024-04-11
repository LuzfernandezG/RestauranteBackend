
import bcryptjs from "bcryptjs"; //libreria que permitira la encriptacion de contraseñas
import jsonwebtoken from "jsonwebtoken";//maneja de contraseña para login tipo token 
import dotenv from "dotenv";//libreria para variables de entorno 
import connection from "./db.js";

// Aquí puedes utilizar la conexión a la base de datos
dotenv.config();


async function login(req, res) {
    const user = req.body.user;
    const password = req.body.password;

    if (!user || !password) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    try {
        const query = 'SELECT * FROM users WHERE user = ?';
        connection.query(query, [user], (error, results, fields) => {
            if (error) {
                console.error("Error durante el inicio de sesión:", error);
                return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
            }

            if (results.length === 0) {
                return res.status(400).send({ status: "Error", message: "Error durante el inicio de sesión" });
            }

            //comparacion de la contraseña con bcrypts

            const usuarioRevisar = results[0];
            bcryptjs.compare(password, usuarioRevisar.password, (compareError, logincorrecto) => {
                if (compareError) {
                    console.error("Error durante el inicio de sesión:", compareError);
                    return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
                }

                if (!logincorrecto) {
                    return res.status(400).send({ status: "Error", message: "Error durante el inicio de sesión" });
                }

                const token = jsonwebtoken.sign(
                    { user: usuarioRevisar.nombre },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRATION }
                );

                const cookieOption = {
                    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    path: "/"
                };

                res.cookie("jwt", token, cookieOption);
                res.send({ status: "ok", message: "Usuario loggeado", redirect: "/admin" });
            });
        });
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}



async function register(req, res) {
    try {
        const { user,email,password } = req.body;

        // Verifica que los campos no estén vacíos
        if (!user || !password || !email) {
            return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
        }

        // Verifica si el usuario ya existe en la base de datos
        const query = "SELECT * FROM users WHERE user = ?";
        connection.query(query, [user], async (error, results, fields) => {
            if (error) {
                console.error("Error al buscar al usuario:", error);
                return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
            }

            if (results.length > 0) {
                return res.status(400).send({ status: "Error", message: "Este usuario ya existe" });
            }

            // Genera el hash de la contraseña
            const salt = await bcryptjs.genSalt(5); //seguridad la encriptacion
            const hashContraseña = await bcryptjs.hash(password, salt);
            const fechaCreacion = new Date().toISOString().split('T')[0];

            // Inserta el nuevo usuario en la base de datos
            const insertQuery = "INSERT INTO users (user, email, password, dc) VALUES (?, ?, ?, ?)";
            connection.query(insertQuery, [user, email, hashContraseña, fechaCreacion], (insertError, insertResults, insertFields) => {
                if (insertError) {
                    console.error("Error al registrar al usuario:", insertError);
                    return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
                }

                // Envía la respuesta de éxito
                res.status(201).send({ status: "ok", message: `Usuario ${user} agregado`, redirect: "/" });
            });
        });
    } catch (error) {
        console.error("Error en la función de registro:", error);
        res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}
//exporta los metodos para poder ser ejecutados en otros archivos
export const methods = {
    login,
    register
}