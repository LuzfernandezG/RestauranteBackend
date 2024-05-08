
//importaciones
import bcryptjs from "bcryptjs"; //libreria que permitira la encriptacion de contraseñas
import jsonwebtoken from "jsonwebtoken";//maneja de contraseña para login tipo token 
import dotenv from "dotenv";//libreria para variables de entorno 
import connection from "./db.js";
import { response } from 'express';
dotenv.config();

//Funcion para login
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
                if (usuarioRevisar.modo === 1) {
                    // Si el modo es 1, redirigir al admin
                    res.send({ status: "ok", message: "Usuario loggeado", token, redirect: "/admin" });
                } else {
                    // Si el modo es 0, redirigir al home
                    res.send({ status: "ok", message: "Usuario loggeado", token, redirect: "/home" });
                }
            });
        });
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}
//Funcion para registrar usuario
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
                res.status(201).send({ status: "ok", message: `Usuario ${user} agregado`, redirect: "/login" });
            });
        });
    } catch (error) {
        console.error("Error en la función de registro:", error);
        res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}

//Funcion para cerrar sesion
async function logout(req, res = response) {
    try {
        // Eliminar la cookie jwt del cliente
        res.clearCookie("jwt");

        // Envía una respuesta exitosa
        res.status(200).send({ status: "ok", message: "Usuario deslogueado exitosamente" });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}

/*MANEJO DE MESAS*/

//Funcion para crear mesa
function crearMesa(nombre, numero, descripcion) {
    const sql = `INSERT INTO mesas (nombre, numero, descripcion) VALUES (?, ?, ?)`;
    connection.query(sql, [nombre, numero, descripcion], (err, result) => {
      if (err) throw err;
      console.log(`Se ha creado una nueva mesa con ID: ${result.insertId}`);
    });
  }
  

  // Función para modificar una mesa por número de mesa
  function modificarMesaPorNumero(numeroMesa, nuevosDatos) {
    const sql = `UPDATE mesas SET ? WHERE numero = ?`;
    connection.query(sql, [nuevosDatos, numeroMesa], (err, result) => {
      if (err) throw err;
      console.log(`Se han modificado ${result.changedRows} mesa(s)`);
    });
  }
  
  // Función para imprimir todas las mesas
  function imprimirMesas(callback) {
    const sql = `SELECT * FROM mesas`;
    connection.query(sql, (err, result) => {
      if (err) {
        console.error("Error al imprimir las mesas:", err);
        callback([]);
      } else {
        console.log("Mesas encontradas:", result);
        callback(result);
      }
    });
  }
  
  // Función para eliminar una mesa por número de mesa
  function eliminarMesaPorNumero(numeroMesa) {
    const sql = `DELETE FROM mesas WHERE numero = ?`;
    connection.query(sql, [numeroMesa], (err, result) => {
      if (err) throw err;
      console.log(`Se han eliminado ${result.affectedRows} mesa(s)`);
    });
  }

//Funcion para obtener mesas no reservadas apartir de una fecha
  const obtenerMesasDisponibles = async (req, res) => {
    const { fecha } = req.query;
    
    try {
      // Consulta SQL para obtener las mesas que no están reservadas para la fecha especificada
      const sql = `
        SELECT *
        FROM mesas
        WHERE numero NOT IN (
          SELECT numero_mesa
          FROM reservas
          WHERE fecha = ?
        )
      `;
      connection.query(sql, [fecha], (error, results, fields) => {
        if (error) {
          console.error("Error al obtener las mesas disponibles:", error);
          return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      console.error("Error al obtener las mesas disponibles:", error);
      return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
  }

/*FUNCIONES PARA RESERVACION DE MESAS*/

//Funcion para reservar mesa
function reservarMesa(nombreReservante, fecha, numeroMesa, motivo) {
    verificarMesaDisponible(numeroMesa, fecha, (disponible) => {
        if (!disponible) {
            console.error("La mesa no está disponible para esa fecha");
            return;
        }
        const insertSql = `INSERT INTO reservas (nombre_reservante, fecha, numero_mesa, motivo) VALUES (?, ?, ?, ?)`;
        connection.query(insertSql, [nombreReservante, fecha, numeroMesa, motivo], (insertErr, insertResult) => {
            if (insertErr) {
                console.error("Error al reservar la mesa:", insertErr);
                throw insertErr;
            }
            console.log(`Se ha realizado la reserva con ID: ${insertResult.insertId}`);
        });
    });
}
//Funcion para actualizar estado de mesa
function actualizarEstadoMesa(numeroMesa, estado) {
    const sql = `UPDATE mesas SET estado = ? WHERE numero = ?`;
    connection.query(sql, [estado, numeroMesa], (err, result) => {
      if (err) throw err;
      console.log(`Se ha actualizado el estado de la mesa ${numeroMesa} a ${estado}`);
    });
}

//Funcion comparativa de numero y fecha para saber si esta disponible
function verificarMesaDisponible(numeroMesa, fecha, callback) {
    const sql = `SELECT * FROM reservas WHERE numero_mesa = ? AND fecha = ?`;
    connection.query(sql, [numeroMesa, fecha], (err, result) => {
      if (err) {
        console.error("Error al verificar la disponibilidad de la mesa:", err);
        callback(false);
      } else {
        callback(result.length === 0); 
      }
    });
}
//Funcion para imprimir las reservas 
    function imprimirReservas(callback) {
        const sql = `SELECT * FROM reservas`;
        connection.query(sql, (err, result) => {
          if (err) {
            console.error("Error al imprimir las reservas:", err);
            callback([]);
          } else {
            console.log("Reservas encontradas:", result);
            callback(result);
          }
        });
      }

/*EXPORTACION DE METODOS*/ 
export const methods = {
    login,
    register,
    logout,
    crearMesa,
    modificarMesaPorNumero,
    imprimirMesas,
    eliminarMesaPorNumero,
    reservarMesa,
    actualizarEstadoMesa,
    verificarMesaDisponible,
    obtenerMesasDisponibles,
    imprimirReservas
}