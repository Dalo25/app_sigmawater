const { promisify } = require("util");
const conexion = require("../database/db");

// ? ========>>> ZONA DE VENDEDORES <<<========
// todo ===========>>>  Mostrar lista de VENDEDORES
exports.listarVendedores = async (req, res) => {
  const lista_vendedores = await conexion.query("SELECT * FROM registro_de_vendedores");
  const usuarios = await conexion.query("SELECT * FROM usuarios");

  lista_vendedores.forEach((v) => {
    v.estadoVendedor = {};
    v.estadoVendedor.txt = "Pendiente";
    v.estadoVendedor.color = "badge-soft-warning";

    if (usuarios.length > 0) {
      // Validando si la tabla de usuarios tiene registros

      usuarios.forEach((u) => {
        // Comparando tabla de usuarios con vendedores
        if (v.id_vendedor == u.id_vendedor) {
          v.estadoDe_laCuenta = u.estado_de_la_cuenta;

          if (u.estado_de_la_cuenta === "aprobado") {
            v.estadoVendedor.txt = "Aprobado";
            v.estadoVendedor.color = "badge-soft-success";
          }

          if (u.estado_de_la_cuenta === "bloqueado") {
            v.estadoVendedor.txt = "Bloqueado";
            v.estadoVendedor.color = "badge-soft-danger";
          }
        }
      });
    }
  });

  res.render("./1-admin/vendedores", {
    user: req.user,
    lista_vendedores,
  });
};
// ! >>>>>>>>> Vista perfil vendedores <<<<<<<<<<<
exports.listarVendedores_PerfilVendedores = async (req, res) => {
  const id_vendedor = req.params.id;
  let info_vendedor = await conexion.query("SELECT * FROM registro_de_vendedores WHERE id_vendedor = ? ", [id_vendedor]);
  info_vendedor = info_vendedor[0];

  const licencia = JSON.parse(info_vendedor.licencia_conduccion);

  // todo===========>>>  Mostrar afiliados a tal vendedor
  let afiliados = await conexion.query("SELECT * FROM registro_de_vendedores WHERE codigo_afiliado = ?", [info_vendedor.id_vendedor]);

  // todo===========>>>  Mostrar afiliado a este vendedor
  // Consultando en DB los clientes que pertenecen al vendedor actual
  let referente = await conexion.query("SELECT * FROM registro_de_vendedores WHERE id_vendedor = ? LIMIT 1",
    [info_vendedor.codigo_afiliado]
  );
  referente = referente[0];

  // todo===========>>>  Mostrar estado actual de un vendedor
  let viewsUser = await conexion.query("SELECT * FROM usuarios WHERE id_vendedor = ? LIMIT 1", [info_vendedor.id_vendedor]);
  viewsUser = viewsUser[0];

  // todo ===============================>>> Estado del solicitar credito y estado de instalacion + cliente por vendedor
  let infoClientes = await conexion.query("SELECT * FROM nuevos_cliente WHERE codigo_id_vendedor = ?", [id_vendedor]);
  let clCredito = await conexion.query("SELECT * FROM solicitar_credito");
  let clAgenda = await conexion.query("SELECT * FROM agendar_instalacion");
  let cltestAgua = await conexion.query("SELECT * FROM test_agua");

  infoClientes.forEach((info) => {

    info.estadoCreditoCliente = {};
    info.estadoCreditoCliente.txt = "No solicitado";
    info.estadoCreditoCliente.color = "badge-soft-dark";

    info.estadoAgendar = {}
    info.estadoAgendar.txt = "No instalado";
    info.estadoAgendar.color = "badge-soft-dark";

    info.sistema = {};
    info.sistema.txt = "N/A";

    if (clCredito.length > 0) {
      clCredito.forEach((c) => {
        if (info.id == c.id_cliente) {
          if (c.estado_del_credito == 0) {
            info.estadoCreditoCliente.txt = "Pendiente";
            info.estadoCreditoCliente.color = "badge-soft-warning";
          }
          if (c.estado_del_credito == 1) {
            info.estadoCreditoCliente.txt = "Aprobado";
            info.estadoCreditoCliente.color = "badge-soft-success";
          }
          if (c.estado_del_credito == 2) {
            info.estadoCreditoCliente.txt = "Bloqueado";
            info.estadoCreditoCliente.color = "badge-soft-danger";
          }
        }
      });
    }
    if (clCredito.length > 0) {
      clCredito.forEach((x) => {
        if (info.id == x.id_cliente) {
          if (x.sistema === "Reverse Osmosis System") {
            info.sistema.txt = "Reverse Osmosis System";
          }
          if (x.sistema === "Whole System") {
            info.sistema.txt = "Whole System";
          }
        }
      });
    }

    if (clAgenda.length > 0) {
      clAgenda.forEach((a) => {
        if (info.id == a.id_cliente) {
          if (a.estado_agenda == 0) {
            info.estadoAgendar.txt = "Listo para instalar";
            info.estadoAgendar.color = "badge-soft-warning";
          }
          if (a.estado_agenda == 1) {
            info.estadoAgendar.txt = "Instalado";
            info.estadoAgendar.color = "badge-soft-success";
          }
        }
      });
    }
  });


  // * >>> Renderizado <<<<<
  res.render("./1-admin/perfil-vendedores", {
    user: req.user, info_vendedor, afiliados,
    referente, licencia, viewsUser, infoClientes
  });
};
// todo ===========>>>  Actualizar nivel de vendedores
exports.ActualizarNivel = async (req, res) => {

  const id_vendedor = req.body.coodigoActualizarxs;
  const nivel = req.body.nivel;

  const datosNivel = { nivel, id_vendedor };

  await conexion.query("UPDATE registro_de_vendedores SET ? WHERE id_vendedor = ? ", [datosNivel, id_vendedor], (err, result) => {
    if (err) throw err;

    if (result) {
      res.redirect("/perfil-vendedores/" + id_vendedor);
    }
  }
  );
};
// todo ===========>>>  Actualizar estado de vendedores

exports.actualizarEstadoVendedor = async (req, res) => {

  const id_vendedor = req.body.idGenerado;

  const id_consecutivo = req.body.id_consecutivoVendedor;

  const estado_de_la_cuenta = req.body.estadoElegido;

  const datosEstado_vendedor = { estado_de_la_cuenta, id_consecutivo };


  await conexion.query("UPDATE usuarios SET ? WHERE id_vendedor = ? ", [datosEstado_vendedor, id_vendedor], (err, result) => {
    if (err) throw err;

    if (result) {
      res.redirect("/perfil-vendedores/" + id_vendedor);
    }

  }
  );
};
// ? ========>>> ZONA DE VENDEDORES <<<========

// ? ========>>> ZONA DE CLIENTES <<<========
// todo ===========>>>  Mostrar lista de CLIENTES y referencia de su vendedor
exports.listarClientes = async (req, res) => {
  let lista_clientes = await conexion.query(
    "SELECT N.*, S.sistema,S.estado_del_credito, A.estado_agenda FROM nuevos_cliente N LEFT JOIN solicitar_credito S ON N.id = S.id_cliente LEFT JOIN agendar_instalacion A ON N.id = A.id_cliente LEFT JOIN test_agua T ON A.id_cliente = T.id;"
  );

  lista_clientes.forEach((c) => {
    /** Estado del Crédito */
    c.estadoCredito = {};
    c.estadoCredito.txt = "No solicitado";
    c.estadoCredito.color = "badge-soft-dark";

    if (c.estado_del_credito == 0) {
      c.estadoCredito.txt = "En revisión";
      c.estadoCredito.color = "badge-soft-warning";
    }
    if (c.estado_del_credito == 1) {
      c.estadoCredito.txt = "Aprobado";
      c.estadoCredito.color = "badge-soft-success";
    }
    if (c.estado_del_credito == 2) {
      c.estadoCredito.txt = "Rechazado";
      c.estadoCredito.color = "badge-soft-danger";
    }
    if (c.estado_del_credito == 3) {
      c.estadoCredito.txt = "Pagado (cash)";
      c.estadoCredito.color = "badge-soft-info";
    }
    /** Estado de la instalación */
    c.estadoAgenda = {};
    c.estadoAgenda.txt = "No instalado";
    c.estadoAgenda.color = "badge-soft-dark";

    if (c.estado_agenda == 0) {
      c.estadoAgenda.txt = "Listo para instalar";
      c.estadoAgenda.color = "badge-soft-warning";
    }

    if (c.estado_agenda == 1) {
      c.estadoAgenda.txt = "Instalado";
      c.estadoAgenda.color = "badge-soft-success";
    }

    /** Formateando la fecha */
    // const f = new Date(c.fecha_test)
    // c.fecha_test = f.toLocaleDateString("en-US")
  });

  // * >>> Renderizado <<<<<
  res.render("./1-admin/listar-clientes", { user: req.user, lista_clientes });
};

//* Formateando precios a una moneda 
const formatear = new Intl.NumberFormat('en-US', {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

// ! >>>> Tarjetas en la vista perfil clientes <<<<<<<<<<<
exports.listarClientes_PerfilClientes = async (req, res) => {
  const id_cliente = req.params.id;
  let info_clientes = await conexion.query("SELECT * FROM nuevos_cliente  WHERE id_cliente = ?", [id_cliente]);
  info_clientes = info_clientes[0];

  // todo ===============================>>> Estado del solicitar credito
  let credito = await conexion.query('SELECT * FROM solicitar_credito WHERE id_cliente = ? LIMIT 1', [info_clientes.id])
  let estado = []
  estado.txt = "No solicitado";
  estado.color = 'badge-soft-dark'

  if (credito.length > 0) {
    credito = credito[0]
    if (credito.estado_del_credito === '0') {
      estado.txt = "En revisión";
      estado.color = 'badge-soft-warning'

    } else if (credito.estado_del_credito == 1) {
      estado.txt = "Aprobado";
      estado.color = 'badge-soft-success'

    } else if (credito.estado_del_credito == 2) {
      estado.txt = "Rechazado";
      estado.color = 'badge-soft-danger'

    } else if (credito.estado_del_credito == 3) {
      estado.txt = "Pagado";
      estado.color = 'badge-soft-info'

    }
  }

  // todo =========================>> Mostrar información del test de agua del cliente
  let informacionTestAgua = await conexion.query('SELECT * FROM test_agua WHERE id_cliente = ?  ', [info_clientes.id])

  // * >>> Estados del testeo (visita al cliente)
  let consultaEstado_testAgua = await conexion.query('SELECT * FROM test_agua WHERE id_cliente = ?  ORDER BY id DESC LIMIT 1', [info_clientes.id])

  let estadoVisita_testAgua = []
  estadoVisita_testAgua.txt = "A la fecha el cliente aun no ha sido visitado";
  estadoVisita_testAgua.color = '';
  estadoVisita_testAgua.background = 'noVisitado';

  if (consultaEstado_testAgua.length > 0) {
    consultaEstado_testAgua = consultaEstado_testAgua[0]

    if (consultaEstado_testAgua.estado_visita_test === '0') {
      estadoVisita_testAgua.txt = "Se realizó un test de agua el";
      estadoVisita_testAgua.background = 'visitado';
    }
  }

  // todo =========================>> Consulta del PRIMER test de agua para la fecha y grafica
  let consulta_PrimerTestAgua = await conexion.query('SELECT * FROM test_agua ORDER BY id DESC LIMIT 1, 1', [info_clientes.id])

  if (consulta_PrimerTestAgua.length > 0) {
    consulta_PrimerTestAgua = consulta_PrimerTestAgua[0]
  }
  const datosJson_PrimerTestagua = JSON.stringify(consulta_PrimerTestAgua);

  // todo =========================>> Consulta del ULTIMO test de agua para la fecha y grafica
  let consulta_UltimoTestAgua = await conexion.query('SELECT * FROM test_agua WHERE estado_visita_test = 0 ORDER BY id DESC LIMIT 1; ', [info_clientes.id])

  if (consulta_UltimoTestAgua.length > 0) {
    consulta_UltimoTestAgua = consulta_UltimoTestAgua[0]
  }
  const datosJson_UltimoTestagua = JSON.stringify(consulta_UltimoTestAgua);

  // todo =========================>> Mostrar información del ahorro del cliente
  let ahorroCalculado = await conexion.query('SELECT * FROM ahorro WHERE id_cliente = ?  ORDER BY id DESC LIMIT 1', [info_clientes.id])
  if (ahorroCalculado.length > 0) {
    ahorroCalculado = ahorroCalculado[0]
  }
  const datosJson_ahorroCalculado = JSON.stringify(ahorroCalculado);

  // todo =========================>> Estados de la agenda para instalar el producto
  let consultaEstado_instalacion = await conexion.query('SELECT * FROM agendar_instalacion WHERE id_cliente = ? LIMIT 1 ', [info_clientes.id])

  let estado_intalacion = []
  estado_intalacion.txt = "La instalación del producto no ha sido agendada";
  estado_intalacion.background = 'noVisitado';

  if (consultaEstado_instalacion.length > 0) {
    consultaEstado_instalacion = consultaEstado_instalacion[0]

    if (consultaEstado_instalacion.estado_agenda === '0') {
      estado_intalacion.txt = "Listo para instalar";
      estado_intalacion.background = 'producto_instalado';

    } else if (consultaEstado_instalacion.estado_agenda == 1) {
      estado_intalacion.txt = "Instalado";
      estado_intalacion.background = 'visitado';

    }
  }
  // todo ===============================>>> Mostrar evidencia de la instalacion
  let clRegistro_instalacion = await conexion.query('SELECT * FROM servicios_de_instalacion WHERE id_cliente = ? LIMIT 1', [info_clientes.id])

  if (clRegistro_instalacion.length > 0) {
    clRegistro_instalacion = clRegistro_instalacion[0]
    var evidenciaF = JSON.parse(clRegistro_instalacion.evidencia_fotografica);
  }
  // todo ===============================>>> Desactivar boton de registro de instalacion ubicado en Perfil-cliente
  let clInstalacion = await conexion.query('SELECT * FROM agendar_instalacion WHERE id_cliente = ? LIMIT 1', [info_clientes.id])
  let estadu = []
  estadu.txt = "No hecho";
  estadu.color = 'badge-soft-dark'
  estadu.verbtnI = false;

  if (clInstalacion.length > 0) {
    clInstalacion = clInstalacion[0]

    if (clInstalacion.estado_agenda == 0) {
      estadu.verbtnI = true;

    } else if (clInstalacion.estado_agenda == 1) {
      estadu.verbtnI = false;
    }

  }


  // todo ===============================>>> Mostrar agenda sobre la instalacion del producto
  let mostrarAgenda = await conexion.query("SELECT * FROM agendar_instalacion WHERE id_cliente = ?", [info_clientes.id]);
  mostrarAgenda = mostrarAgenda[0]

  let mostrarDatoscreditos = await conexion.query("SELECT * FROM solicitar_credito WHERE id_cliente = ?", [info_clientes.id]);
  mostrarDatoscreditos = mostrarDatoscreditos[0]
  if (mostrarDatoscreditos) {

    mostrarDatoscreditos.monto_financiar_cliente = formatear.format(mostrarDatoscreditos.monto_financiar_cliente)
  }
  let clbotonCredito = await conexion.query('SELECT * FROM solicitar_credito WHERE id_cliente = ? LIMIT 1', [info_clientes.id])
  let estade = []
  estade.txt = "No hecho";
  estade.color = 'badge-soft-dark'
  estade.btncredito = false;

  if (clbotonCredito.length > 0) {
    clbotonCredito = clbotonCredito[0]

    if (clbotonCredito.estado_del_credito == 0) {
      estade.txt = "si hecho";
      estade.btncredito = true;

    } else if (clbotonCredito.estado_del_credito == 1) {
      estade.btncredito = false;

    } else if (clbotonCredito.estado_del_credito == 2) {
      estade.btncredito = false;

    } else if (clbotonCredito.estado_del_credito == 3) {
      estade.btncredito = false;

    }
    if (clbotonCredito.licencia_cliente > 0) {
      var licenciacredito = JSON.parse(clbotonCredito.licencia_cliente);
      // var clfirmaAcuerdo  = clbotonCredito.acuerdo_firmado
    } else {

    }
  }
  // todo ========>>> Mostrar producto 
  let mostrarProducto = await conexion.query('SELECT * FROM solicitar_credito WHERE id_cliente = ? LIMIT 1', [info_clientes.id])
  mostrarProducto = mostrarProducto[0]

  // * >>> Renderizado <<<<<
  res.render("./1-admin/perfil-cliente", {
    user: req.user, estado,
    info_clientes, informacionTestAgua, estadoVisita_testAgua,
    consulta_PrimerTestAgua, datosJson_PrimerTestagua,
    consulta_UltimoTestAgua, datosJson_UltimoTestagua,
    ahorroCalculado, datosJson_ahorroCalculado, estado_intalacion,
    estadu, mostrarAgenda, mostrarDatoscreditos, estade,
    licenciacredito, clRegistro_instalacion, evidenciaF, mostrarProducto
  });
};
// todo =======>>> Actualizar Estado del credito desde el panel de administrador - perfil-cliente
exports.ActualizarCredito = async (req, res) => {

  const id_cliente = req.body.id_cliente;
  const estado_del_credito = req.body.estado_del_credito;

  const datosEstadoCredito = { estado_del_credito, id_cliente };
  await conexion.query("UPDATE solicitar_credito SET ? WHERE id_cliente = ? ", [datosEstadoCredito, id_cliente], (err, result) => {
    if (err) { res.send(false) }
    res.send(true)
  }
  );
};
// todo =======>>> Actualizar monto aprobado desde el panel de administrador - perfil-cliente
exports.ActualizarMontoAprobado = async (req, res) => {
  const id_cliente = req.body.id_cliente;
  const monto_aprobado = req.body.monto_aprobado.replace(/[$ ,]/g, '');

  const datosUpdateMontoAprobado = { monto_aprobado, id_cliente };
  await conexion.query("UPDATE solicitar_credito SET ? WHERE id_cliente = ? ", [datosUpdateMontoAprobado, id_cliente], (err, result) => {
    if (err) res.send(false)
    res.send(true)
  });
};

exports.clfirmas = async (req, res) => {

  const id_cliente = req.params.id;
  let info_clientes2 = await conexion.query("SELECT * FROM nuevos_cliente  WHERE id_cliente = ?",[id_cliente]);
  info_clientes2 = info_clientes2[0];

  let clfirmasAcuerdo = await conexion.query('SELECT * FROM solicitar_credito WHERE id_cliente = ? LIMIT 1', [info_clientes2.id])
  let estade = []
  estade.txt = "No hecho";
  estade.color = 'badge-soft-dark'
  estade.btncredito = false;
  
  if (clfirmasAcuerdo.length > 0) {
    clfirmasAcuerdo = clfirmasAcuerdo[0]
      
      var firmas  = clfirmasAcuerdo.acuerdo_firmado
    }

  // * >>> Renderizado <<<<<
  res.render("./1-admin/acuerdo", { user: req.user,info_clientes2, firmas  });

}

// todo --> Formulario servicio instalado
exports.servicioInstaladosx = async (req, res) => {

  const fecha_instalacion = req.body.fechaDeInstalacion;
  const producto_instalado = req.body.productoInstalado;
  const serial_producto = req.body.serial_producto;
  const instalador = req.body.instalador;
  const evidencia = '../evidenciaServicio/' + urlLicencias[0]
  const evidencia_fotografica = JSON.stringify({ 'evidencia': evidencia, });
  const nota = req.body.nota;


  const id_cliente = req.body.id_cliente
  const codigo_cliente = req.body.codigo_cliente

  const estado_agenda = 1

  const Datos_servicio = { fecha_instalacion, producto_instalado, serial_producto, instalador, evidencia_fotografica, nota, id_cliente }
  const Datos_estado = { estado_agenda }
  const Datos_factura = { producto_instalado, fecha_instalacion, id_cliente, codigo_cliente }

  await conexion.query('UPDATE agendar_instalacion SET ? WHERE id_cliente = ?', [Datos_estado, id_cliente])

  await conexion.query('INSERT INTO factura SET ?', [Datos_factura])

  await conexion.query('INSERT INTO servicios_de_instalacion SET ?', [Datos_servicio], (err, result) => {
    if (err) throw err;
    if (result) { res.redirect('/perfil-cliente/' + codigo_cliente) }

  })

}

/* FACTURAS DE VENTAS + DISPERSIONES DE COMISIONES + DEDUCCIONES */
exports.factura = async (req, res) => {

  // Comisiones máximas para el producto grande ($8.500 USD)
  let comisionMax = {}

  const clientes = await conexion.query("SELECT * FROM nuevos_cliente")
  const credito = await conexion.query("SELECT id_cliente, monto_aprobado, porcentaje_aprobado, monto_maximo, sistema FROM solicitar_credito")
  const vendedores = await conexion.query("SELECT id, nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores")

  clientes.forEach(cl => {
    credito.forEach(cre => {
      
      // Comisiones máximas para el producto pequeño ($4.250 USD)
      if (cre.sistema == "Reverse Osmosis System") {
        comisionMax.nivel1 = 700
        comisionMax.nivel2 = 950
        comisionMax.nivel3 = 1300
      } else {
        // Comisiones máximas para el producto grande ($8.500 USD)
        comisionMax.nivel1 = 1400
        comisionMax.nivel2 = 1900
        comisionMax.nivel3 = 2400
      }

      
      vendedores.forEach(async v => {
        
        if (cl.id == cre.id_cliente && cl.id_vendedor == v.id) {
          cl.credito = {}
          cl.credito.monto_aprobado = parseInt(cre.monto_aprobado)
          cl.credito.monto_maximo = parseInt(cre.monto_maximo)
          cl.credito.porcentaje_aprobado = parseInt(cre.porcentaje_aprobado)


          const porcentaje = parseFloat(cl.credito.porcentaje_aprobado/100)

        // vendedores.forEach(async v => {
          // if (cl.id_vendedor == v.id ) {
            cl.vendedor = {}
            cl.vendedor.codigo = v.id_vendedor
            cl.vendedor.nombre = v.nombres + v.apellidos
            cl.vendedor.nivel = v.nivel
            cl.vendedor.afiliado = v.codigo_afiliado
            const cod = v.codigo_afiliado
    
            if(cl.credito) {

              /********  Comisión Directa al Vendedor cuando el porcentaje aprobado es mayor al 80% ********/
              if (cl.credito.porcentaje_aprobado >= 80) {
                
                switch (cl.vendedor.nivel) {
                  // VENDEDOR NIVEL 1
                  case '1':
                    // COMISIÓN NIVEL 1
                    cl.vendedor.comision_base = comisionMax.nivel1;

                    // Validar si tiene un vendedor afiliado arriba
                    if (cod) {
                      let cod2 = '0', cod3 = '0';

                      let v2 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cod])

                      v2.length > 0 ? cod2 = v2[0].codigo_afiliado : cod2 = cod2;

                      let v3 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cod2])

                      v3.length > 0 ? cod3 = v3[0].codigo_afiliado : cod3 = cod3;

                      let v4 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cod3])

                      console.log("\n---------- VENDEDORES TEST ---------- \n")
                      let count = 2;
                      if (v2[0] != undefined) {
                        console.log("\n ------- INFO DB ------- \n")
                        console.log("Vendedor "+count, v2[0]);
                        console.log("\n ------- INFO DB ------- \n")
                        count++

                        cl.vendedor2 = {}
                        cl.vendedor2.codigo = v2[0].id_vendedor
                        cl.vendedor2.nombre = v2[0].nombres + v2[0].apellidos
                        cl.vendedor2.nivel = v2[0].nivel
                        cl.vendedor2.afiliado = v2[0].codigo_afiliado

                        // Asignando comisión base vendedor arriba -> (Comisión máxima del vendedor arriba con base a su nivel menos la comisión base del vendedor principal)
                        if (v2[0].nivel == '2') {
                          cl.vendedor2.comision_base = (comisionMax.nivel2-cl.vendedor.comision_base);
                        } else if (v2[0].nivel == '3') {
                          cl.vendedor2.comision_base = (comisionMax.nivel3-cl.vendedor.comision_base);
                        } else {
                          cl.vendedor2.comision_base = (cl.credito.monto_aprobado-3000-cl.vendedor.comision_base);
                        }

                      } 

                      if (v3[0] != undefined) {
                        console.log("\n ------- INFO DB ------- \n")
                        console.log("Vendedor "+count, v3[0])
                        console.log("\n ------- INFO DB ------- \n")
                        count++

                        cl.vendedor3 = {}
                        cl.vendedor3.codigo = v3[0].id_vendedor
                        cl.vendedor3.nombre = v3[0].nombres + v3[0].apellidos
                        cl.vendedor3.nivel = v3[0].nivel
                        cl.vendedor3.afiliado = v3[0].codigo_afiliado

                        if (v3[0].nivel == '3') {
                          cl.vendedor3.comision_base = (comisionMax.nivel3-cl.vendedor.comision_base);
                        } else {
                          cl.vendedor3.comision_base = (cl.credito.monto_aprobado-3000-cl.vendedor.comision_base-cl.vendedor2.comision_base);
                        }
                      } 

                      if (v4[0] != undefined) {
                        console.log("\n ------- INFO DB ------- \n")
                        console.log("Vendedor "+count, v4[0])
                        console.log("\n ------- INFO DB ------- \n")

                        cl.vendedor4 = {}
                        cl.vendedor4.codigo = v4[0].id_vendedor
                        cl.vendedor4.nombre = v4[0].nombres + v3[0].apellidos
                        cl.vendedor4.nivel = v4[0].nivel
                        cl.vendedor4.afiliado = v4[0].codigo_afiliado

                        cl.vendedor4.comision_base = (cl.credito.monto_aprobado-3000-cl.vendedor.comision_base-cl.vendedor2.comision_base-cl.vendedor3.comision_base);
                        
                      }
                      console.log("\n ------- COMISIONES VENDEDORES ** INICIO ------- \n")
                      console.log(cl)
                      console.log("\n ------- COMISIONES VENDEDORES ** FIN ------- \n")
                      console.log("\n ************** \n")
                      console.log("\n---------- VENDEDORES TEST ---------- \n")






























                      // // VENDEDOR ARRIBA DEl NIVEL 1 >= 80%
                      // if (vendedor2.length > 0) {
                      //   cl.vendedor2 = {}
                      //   cl.vendedor2.codigo = vendedor2[0].id_vendedor
                      //   cl.vendedor2.nombre = vendedor2[0].nombres + vendedor2[0].apellidos
                      //   cl.vendedor2.nivel = vendedor2[0].nivel
                      //   cl.vendedor2.afiliado = vendedor2[0].codigo_afiliado
                        
                      //   // let comision_vendedorSuperior = vendedorSuperior(vendedor2, comisionMax)
                      //   let comision_vendedorSuperior = 2222;

                      //   // Asignando comisión base vendedor arriba -> (Comisión máxima del vendedor arriba con base a su nivel menos la comisión base del vendedor principal)
                      //   cl.vendedor2.comision_base = (comision_vendedorSuperior-cl.vendedor.comision_base);


                      //   // if (cl.vendedor2.afiliado != '' || cl.vendedor2.afiliado != null) {
                          
                      //   //   // VENDEDOR NIVEL 3 DESDE EL 1 >= 80%
                      //   //   const vendedor3 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cl.vendedor2.afiliado])
  
                      //   //   if(vendedor3.length > 0) {
                      //   //     cl.vendedor3 = {}
                      //   //     cl.vendedor3.codigo = vendedor3[0].id_vendedor
                      //   //     cl.vendedor3.nombre = vendedor3[0].nombres + vendedor3[0].apellidos
                      //   //     cl.vendedor3.nivel = vendedor3[0].nivel
                      //   //     cl.vendedor3.afiliado = vendedor3[0].codigo_afiliado
                      //   //     cl.vendedor3.comision_base = (comisionMax.nivel2-cl.vendedor.comision_base);


                      //   //     // VENDEDOR NIVEL 4 DESDE EL 1 >= 80%
                      //   //     const vendedor4 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cl.vendedor3.afiliado])

                      //   //     if(vendedor4.length > 0) {
                      //   //       cl.vendedor3 = {}
                      //   //       cl.vendedor4.codigo = vendedor4[0].id_vendedor
                      //   //       cl.vendedor4.nombre = vendedor4[0].nombres + vendedor4[0].apellidos
                      //   //       cl.vendedor4.nivel = vendedor4[0].nivel
                      //   //       cl.vendedor4.afiliado = vendedor4[0].codigo_afiliado
                      //   //       cl.vendedor4.comision_base = (cl.credito.monto_aprobado-3000-cl.vendedor3.comision_base-cl.vendedor2.comision_base-cl.vendedor.comision_base);
                      //   //     }

                      //   //   }
  
                      //   // }

                      // }
                      

                    }
                    break;

                  // Vendedor nivel 2
                  case '2':
                    cl.vendedor.comision_base = comisionMax.nivel2;
                    if (cod != '' || cod != null) {
                      
                      // VENDEDOR NIVEL 3 DESDE EL 2 >= 80%
                      const vendedor2 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cod])

                      if (vendedor2.length > 0) {
                        cl.vendedor2 = {}
                        cl.vendedor2.codigo = vendedor2[0].id_vendedor
                        cl.vendedor2.nombre = vendedor2[0].nombres + vendedor2[0].apellidos
                        cl.vendedor2.nivel = vendedor2[0].nivel
                        cl.vendedor2.afiliado = vendedor2[0].codigo_afiliado
                        cl.vendedor2.comision_base = (comisionMax.nivel2-cl.vendedor.comision_base);

                        // VENDEDOR NIVEL 4 DESDE EL 2 >= 80%
                        const vendedor3 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cl.vendedor2.afiliado])

                        if(vendedor3.length > 0) {
                          cl.vendedor3 = {}
                          cl.vendedor3.codigo = vendedor3[0].id_vendedor
                          cl.vendedor3.nombre = vendedor3[0].nombres + vendedor3[0].apellidos
                          cl.vendedor3.nivel = vendedor3[0].nivel
                          cl.vendedor3.afiliado = vendedor3[0].codigo_afiliado
                          cl.vendedor3.comision_base = (cl.credito.monto_aprobado-3000-cl.vendedor2.comision_base-cl.vendedor.comision_base);
                        }

                      }
                    }

                    break;

                  // Vendedor nivel 3
                  case '3':
                    cl.vendedor.comision_base = comisionMax.nivel3;
                    if (cod != '' || cod != null) {
                      // VENDEDOR NIVEL 4 DESDE EL 3 >= 80%
                      const vendedor2 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cod])

                      if(vendedor2.length > 0) {
                        cl.vendedor2 = {}
                        cl.vendedor2.codigo = vendedor2[0].id_vendedor
                        cl.vendedor2.nombre = vendedor2[0].nombres + vendedor2[0].apellidos
                        cl.vendedor2.nivel = vendedor2[0].nivel
                        cl.vendedor2.afiliado = vendedor2[0].codigo_afiliado
                        cl.vendedor2.comision_base = (cl.credito.monto_aprobado-3000-cl.vendedor.comision_base);
                      }
                    }
                    break;
                  
                  // Vendedor nivel 4
                  default:
                    cl.vendedor.comision_base = (cl.credito.monto_aprobado-3000);
                    break;
                }


              } else {

                /******** Comisión Directa al Vendedor cuando el porcentaje aprobado es menor al 80% ********/
                switch (cl.vendedor.nivel) {
                  // VENDEDOR NIVEL 1
                  case '1':
                    cl.vendedor.comision_base = porcentaje*comisionMax.nivel1;
                    if (cod != '' || cod != null) {

                      // VENDEDOR NIVEL 2
                      const vendedor2 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cod])
                      
                      if (vendedor2.length > 0) {
                        cl.vendedor2 = {}
                        cl.vendedor2.codigo = vendedor2[0].id_vendedor
                        cl.vendedor2.nombre = vendedor2[0].nombres + " " + vendedor2[0].apellidos
                        cl.vendedor2.nivel = vendedor2[0].nivel
                        cl.vendedor2.afiliado = vendedor2[0].codigo_afiliado
                        cl.vendedor2.comision_base = (parseFloat(porcentaje*comisionMax.nivel2))-cl.vendedor.comision_base;
                        
                        console.log("\n---------- VENDEDOR 2 desde nivel 1 ---------- \n")
                        console.log(cl)
                        console.log("\n---------- VENDEDOR 2 desde nivel 1 ---------- \n")

                        if (cl.vendedor2.afiliado != '' || cl.vendedor2.afiliado != null) {
  
                          // VENDEDOR NIVEL 3
                          const vendedor3 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cl.vendedor2.afiliado])
  
                          if(vendedor3.length > 0) {
                            cl.vendedor3 = {}
                            cl.vendedor3.codigo = vendedor3[0].id_vendedor
                            cl.vendedor3.nombre = vendedor3[0].nombres + vendedor3[0].apellidos
                            cl.vendedor3.nivel = vendedor3[0].nivel
                            cl.vendedor3.afiliado = vendedor3[0].codigo_afiliado
                            cl.vendedor3.comision_base = parseFloat((porcentaje*comisionMax.nivel3)-(porcentaje*comisionMax.nivel2));

                            console.log("\n---------- VENDEDOR 3 desde nivel 2, 1 ---------- \n")
                            console.log(cl)
                            console.log("\n---------- VENDEDOR 3 desde nivel 2, 1 ---------- \n")

                            // VENDEDOR NIVEL 4
                            const vendedor4 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cl.vendedor3.afiliado])

                            if(vendedor3.length > 0) {
                              cl.vendedor4 = {}
                              cl.vendedor4.codigo = vendedor4[0].id_vendedor
                              cl.vendedor4.nombre = vendedor4[0].nombres + vendedor4[0].apellidos
                              cl.vendedor4.nivel = vendedor4[0].nivel
                              cl.vendedor4.afiliado = vendedor4[0].codigo_afiliado
                              cl.vendedor4.comision_base = parseFloat((porcentaje*comisionMax.nivel3)-(porcentaje*comisionMax.nivel2));
                            }

                          }
  
                        }

                      }
                      

                    }
                    break;
                    
                  //Vendedor Nivel 2
                  case '2':
                    cl.vendedor.comision_base = porcentaje*comisionMax.nivel2;
                    if (cod != '' || cod != null) {
                      const vendedor2 = await conexion.query("SELECT nombres, apellidos, codigo_afiliado, id_vendedor, nivel FROM registro_de_vendedores WHERE id_vendedor = ? ", [cod])

                      if (vendedor2.length > 0) {
                        // Vendedor Nivel 3
                        cl.vendedor2 = {}
                        cl.vendedor2.codigo = vendedor2[0].id_vendedor
                        cl.vendedor2.nombre = vendedor2[0].nombres + vendedor2[0].apellidos
                        cl.vendedor2.nivel = vendedor2[0].nivel
                        cl.vendedor2.afiliado = vendedor2[0].codigo_afiliado
                        cl.vendedor2.comision_base = (parseInt(porcentaje*comisionMax.nivel3))-cl.vendedor.comision_base;
                      }
                      
                    }
                    break;
                  //Vendedor Nivel 3
                  default:
                    cl.vendedor.comision_base = porcentaje*comisionMax.nivel3;
                    break;
                }
      
              }

            }
    
          // }
        // });

      }
    
    });
      
    });

    // console.log(cl)

  });

  // let mostrarFactura =  await conexion.query('SELECT F.*, F.estadoFacturas, C.*, S.monto_aprobado, V.nombres, V.apellidos FROM factura F INNER JOIN nuevos_cliente C ON F.id_factura = C.id LEFT JOIN solicitar_credito S ON F.id_factura = S.id LEFT JOIN registro_de_vendedores V ON C.id_vendedor = V.id;');

  

  // mostrarFactura.forEach((f) => {
 
  //   f.estadoFactura = {};
  //   f.estadoFactura.txt = "N/A";
  //   f.estadoFactura.color = "badge-soft-dark";

  //   if (f.estadoFacturas == 0) {
  //     f.estadoFactura.txt = "Pendiente";
  //     f.estadoFactura.color = "badge-soft-warning";
  //   }
  //   if (f.estadoFacturas == 1) {
  //     f.estadoFactura.txt = "Pagado";
  //     f.estadoFactura.color = "badge-soft-success";
  //   }

  //   f.monto_aprobado = formatear.format(f.monto_aprobado)

  // });

  // f.monto_aprobado = formatear.format(f.monto_aprobado)

  res.render("./1-admin/ventas", { user: req.user, facturaVenta: false });
}