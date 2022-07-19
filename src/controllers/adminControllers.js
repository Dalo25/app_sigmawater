const { promisify } = require("util");
const conexion = require("../database/db");

//* Formateando precios a una moneda
const formatear = new Intl.NumberFormat('en-US', {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

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
    lista_vendedores
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

exports.listarVendedoresss = async (req, res) => {
  const id_cliente = req.params.id;
  let epa = await conexion.query("SELECT * FROM nuevos_cliente LIMIT 1");
  epa = epa[0]

  res.render("./1-admin/hola", { user: req.user, epa });
};

exports.listarClientes_PerfilClientess = async (req, res) => {
  const id_cliente = req.params.id;
  let info_clientes = await conexion.query("SELECT * FROM nuevos_cliente  WHERE id_cliente = ?",[id_cliente]);
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
    estadoVisita_testAgua.txt= "Se realizó un test de agua el";
    estadoVisita_testAgua.background= 'visitado';
      }
  }

// todo =========================>> Consulta del PRIMER test de agua para la fecha y grafica
    let consulta_PrimerTestAgua = await conexion.query('SELECT * FROM test_agua ORDER BY id DESC LIMIT 1, 1', [info_clientes.id])

    if(consulta_PrimerTestAgua.length > 0 ){
      consulta_PrimerTestAgua = consulta_PrimerTestAgua[0]
    }
    const datosJson_PrimerTestagua = JSON.stringify(consulta_PrimerTestAgua);

// todo =========================>> Consulta del ULTIMO test de agua para la fecha y grafica
 let consulta_UltimoTestAgua = await conexion.query('SELECT * FROM test_agua WHERE estado_visita_test = 0 ORDER BY id DESC LIMIT 1; ', [info_clientes.id])

    if(consulta_UltimoTestAgua.length > 0 ){
      consulta_UltimoTestAgua = consulta_UltimoTestAgua[0]
    }
    const datosJson_UltimoTestagua = JSON.stringify(consulta_UltimoTestAgua);

// todo =========================>> Mostrar información del ahorro del cliente
    let ahorroCalculado = await conexion.query('SELECT * FROM ahorro WHERE id_cliente = ?  ORDER BY id DESC LIMIT 1', [info_clientes.id])
    if(ahorroCalculado.length > 0 ){
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
      estado_intalacion.txt= "Listo para instalar";
      estado_intalacion.background= 'producto_instalado';

    } else if (consultaEstado_instalacion.estado_agenda == 1) {
      estado_intalacion.txt= "Instalado";
      estado_intalacion.background= 'visitado';

    }
}
// todo ===============================>>> Mostrar evidencia de la instalacion
let clRegistro_instalacion = await conexion.query('SELECT * FROM servicios_de_instalacion WHERE id_cliente = ? LIMIT 1', [info_clientes.id])

if (clRegistro_instalacion.length > 0) {
    clRegistro_instalacion = clRegistro_instalacion[0]
  var evidenciaF= JSON.parse(clRegistro_instalacion.evidencia_fotografica);
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
let mostrarAgenda = await conexion.query("SELECT * FROM agendar_instalacion WHERE id_cliente = ?",[info_clientes.id]);
mostrarAgenda = mostrarAgenda[0]

let mostrarDatoscreditos= await conexion.query("SELECT * FROM solicitar_credito WHERE id_cliente = ?",[info_clientes.id]);
mostrarDatoscreditos = mostrarDatoscreditos[0]
if(mostrarDatoscreditos ) {

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

  }  else if (clbotonCredito.estado_del_credito == 2) {
    estade.btncredito = false;

} else if (clbotonCredito.estado_del_credito == 3) {
  estade.btncredito = false;

}
if (clbotonCredito.licencia_cliente >0){
  var licenciacredito = JSON.parse(clbotonCredito.licencia_cliente);
  // var clfirmaAcuerdo  = clbotonCredito.acuerdo_firmado
} else  {

}
}
// todo ========>>> Mostrar producto
let mostrarProducto = await conexion.query('SELECT * FROM solicitar_credito WHERE id_cliente = ? LIMIT 1', [info_clientes.id])
mostrarProducto = mostrarProducto[0]

  // * >>> Renderizado <<<<<
  res.render("./1-admin/create", {
    user: req.user, estado,
    info_clientes, informacionTestAgua, estadoVisita_testAgua,
    consulta_PrimerTestAgua, datosJson_PrimerTestagua,
    consulta_UltimoTestAgua, datosJson_UltimoTestagua,
    ahorroCalculado, datosJson_ahorroCalculado, estado_intalacion,
    estadu, mostrarAgenda, mostrarDatoscreditos, estade,
    licenciacredito,clRegistro_instalacion, evidenciaF,mostrarProducto });
};

/* FACTURAS DE VENTAS + DISPERSIONES DE COMISIONES + DEDUCCIONES */
exports.factura = async (req, res) => {

  const clientes = await conexion.query("SELECT cl.*, cr.id_cliente AS idCliente, cr.monto_aprobado, cr.porcentaje_aprobado, cr.monto_maximo, cr.sistema FROM nuevos_cliente AS cl JOIN solicitar_credito AS cr ON cl.id = cr.id_cliente")
  const vendedores = await conexion.query("SELECT id, nombres, apellidos, codigo_afiliado, id_vendedor, nivel, telefono_movil FROM registro_de_vendedores")
  const factura = await conexion.query("SELECT * FROM factura")

  const arrayVentas = []

  clientes.forEach(cl => {

    cl.monto_aprobado = parseFloat(cl.monto_aprobado)
    cl.porcentaje_aprobado = parseFloat(cl.porcentaje_aprobado)
    cl.monto_maximo = parseFloat(cl.monto_maximo)
    cl.factura = {}
    cl.vendedores = []

    /******* ASIGNANDO FACTURA AL CLIENTE *******/
    // if (factura.length > 0) {
      factura.forEach(f => {
        if (f.id_cliente == cl.id) {
          cl.factura.id = f.id_factura
          cl.factura.fecha  = f.fecha_instalacion

          if (f.estadoFacturas == 0) {
            cl.factura.estadoTxt = "Pendiente";
            cl.factura.estadoColor = "badge-soft-warning";
          }
          if (f.estadoFacturas == 1) {
            cl.factura.estadoTxt = "Pagado";
            cl.factura.estadoColor = "badge-soft-success";
          }
        }
      });
    // }

    /** FIN DATOS DE LA FACTURA **/

    // Comisiones máximas para el producto grande ($8.500 USD)
    let comisionMax_nivel1 = 1400.0, comisionMax_nivel2 = 1900.0, comisionMax_nivel3 = 2400.0, gastos_empresa = 3000.0

    // Comisiones máximas para el producto pequeño ($4.250 USD)
    if (cl.sistema == "Reverse Osmosis System") {
      comisionMax_nivel1 = 700.0
      comisionMax_nivel2 = 950.0
      comisionMax_nivel3 = 1200.0
      gastos_empresa = 1500.0
    }

    let v = vendedores.find(item => item.id == cl.id_vendedor)
    
    if (v) {

      const vendedor = {}, vendedor2 = {}, vendedor3 = {}, vendedor4 = {};
      let v2 = false, v3 = false, v4 = false;
      vendedor.codigo = v.id_vendedor
      vendedor.nombre = v.nombres + " " + v.apellidos
      vendedor.nivel = parseInt(v.nivel)
      vendedor.afiliado = v.codigo_afiliado
      vendedor.telefono = v.telefono_movil

      v.codigo_afiliado != '' ? v2 = vendedores.find(item => item.id_vendedor == v.codigo_afiliado) : v2;

      // VALIDAR SI TIENE UN VENDEDOR 2
      if (v2) {
        vendedor2.codigo = v2.id_vendedor
        vendedor2.nombre = v2.nombres + " " + v2.apellidos
        vendedor2.nivel = parseInt(v2.nivel)
        vendedor2.afiliado = v2.codigo_afiliado
        vendedor2.telefono = v2.telefono_movil

        v2.codigo_afiliado != '' ? v3 = vendedores.find(item => item.id_vendedor == v2.codigo_afiliado) : v3;
      }
      
      // VALIDAR SI TIENE UN VENDEDOR 3
      if (v3) {
        vendedor3.codigo = v3.id_vendedor
        vendedor3.nombre = v3.nombres + " " + v3.apellidos
        vendedor3.nivel = parseInt(v3.nivel)
        vendedor3.afiliado = v3.codigo_afiliado
        vendedor3.telefono = v3.telefono_movil

        v3.codigo_afiliado != '' ? v4 = vendedores.find(item => item.id_vendedor == v3.codigo_afiliado) : v4;
      }

      // VALIDAR SI TIENE UN VENDEDOR 4
      if (v4) {
        vendedor4.codigo = v4.id_vendedor
        vendedor4.nombre = v4.nombres + " " + v4.apellidos
        vendedor4.nivel = parseInt(v4.nivel)
        vendedor4.afiliado = v4.codigo_afiliado
        vendedor4.telefono = v4.telefono_movil
      }

      /********  Comisión Directa al Vendedor cuando el porcentaje aprobado es mayor al 80% ********/
      if (cl.porcentaje_aprobado >= 80) {

        switch (vendedor.nivel) {
          //VENDEDOR PRINCIPAL NIVEL 1
          case 1:
            vendedor.comision_base = comisionMax_nivel1;
            cl.vendedores.push(vendedor)
            //COMISIÓN VENDEDOR 2 (NIVEL 2, 3 o 4)
            if (v2) {
              if (vendedor2.nivel == 2) {
                vendedor2.comision_base = (comisionMax_nivel2 - comisionMax_nivel1)
              } else if (vendedor2.nivel == 3) {
                vendedor2.comision_base = (comisionMax_nivel3 - comisionMax_nivel1)
              } else {
                vendedor2.comision_base = (cl.monto_aprobado - gastos_empresa - comisionMax_nivel1)
              }
              cl.vendedores.push(vendedor2)
            }

            //COMISIÓN VENDEDOR 3 (NIVEL 3 o 4)
            if (v3) {
              if (v3.nivel == 3) {
                vendedor3.comision_base = (comisionMax_nivel3 - vendedor2.comision_base - vendedor.comision_base);
              } else {
                vendedor3.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor2.comision_base - vendedor.comision_base);
              }
              cl.vendedores.push(vendedor3)
            }

            //COMISIÓN VENDEDOR 4 (NIVEL 4)
            if (v4) {
              // Asignando comisión base vendedor nivel 4 -> (Comisión máxima del vendedor nivel 4 menos las comisiones niveles anteriores)
              vendedor4.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor3.comision_base - vendedor2.comision_base - vendedor.comision_base);
              cl.vendedores.push(vendedor4)
            }

            break;
          
          //VENDEDOR PRINCIPAL NIVEL 2
          case 2:
            vendedor.comision_base = comisionMax_nivel2;
            cl.vendedores.push(vendedor)

            //COMISIÓN VENDEDOR 2 (NIVEL 3 o 4)
            if (v2) {
              if (v2.nivel == 3) {
                vendedor2.comision_base = (comisionMax_nivel3 - comisionMax_nivel2)
              } else {
                vendedor2.comision_base = (cl.monto_aprobado - gastos_empresa - comisionMax_nivel3 - comisionMax_nivel2)
              }
              cl.vendedores.push(vendedor2)
            }

            //COMISIÓN VENDEDOR 3 (NIVEL 4)
            if (v3) {
              vendedor3.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor2.comision_base - vendedor.comision_base);
              cl.vendedores.push(vendedor3)
            }

            break;
          
          //VENDEDOR PRINCIPAL NIVEL 3
          case 3:
            vendedor.comision_base = comisionMax_nivel3;
            cl.vendedores.push(vendedor)

            //COMISIÓN VENDEDOR 2 (NIVEL 4)
            if (v2.nivel == 4) {
              vendedor2.comision_base = (cl.monto_aprobado - gastos_empresa - comisionMax_nivel3 - comisionMax_nivel2 - comisionMax_nivel1)
              cl.vendedores.push(vendedor)
            }

            break;
          
          //VENDEDOR PRINCIPAL NIVEL 4
          default:
            vendedor.comision_base = (cl.monto_aprobado - gastos_empresa);
            cl.vendedores.push(vendedor)
            break;
        }

      }
      // /******** Comisión Directa al Vendedor cuando el porcentaje aprobado es MENOR al 80% ------------------------------ ---********/
      else {
        //Convirtiendo porcentaje entero a decimal
        const porcentaje = parseFloat(cl.porcentaje_aprobado/100)

        switch (vendedor.nivel) {
          //VENDEDOR PRINCIPAL NIVEL 1
          case 1:
            vendedor.comision_base = parseFloat(porcentaje * comisionMax_nivel1)
            cl.vendedores.push(vendedor)

            //COMISIÓN VENDEDOR 2 (NIVEL 2, 3 o 4)
            if (v2) {
              if (v2.nivel == 2) {
                vendedor2.comision_base = (parseFloat(porcentaje * comisionMax_nivel2) - vendedor.comision_base)
              } else if (v2.nivel == 3) {
                vendedor2.comision_base = (parseFloat(porcentaje * comisionMax_nivel3) - vendedor.comision_base)
              } else {
                vendedor2.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor.comision_base);
              }
              cl.vendedores.push(vendedor2)
            }
            
            //COMISIÓN VENDEDOR 3 (NIVEL 3 o 4)
            if (v3) {
              if (v3.nivel == 3) {
                vendedor3.comision_base = (parseFloat(porcentaje * comisionMax_nivel3) - vendedor.comision_base)
              } else {
                vendedor3.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor2.comision_base - vendedor.comision_base);
              }
              cl.vendedores.push(vendedor3)
            }

            //COMISIÓN VENDEDOR 4 (NIVEL 4)
            if (v4) {
              vendedor4.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor3.comision_base - vendedor2.comision_base - vendedor.comision_base);
              cl.vendedores.push(vendedor4)
            }

            break;
          
          //VENDEDOR PRINCIPAL NIVEL 2
          case 2:
            vendedor.comision_base = parseFloat(porcentaje * comisionMax_nivel2)
            cl.vendedores.push(vendedor)

            //COMISIÓN VENDEDOR 2 (NIVEL 3 o 4)
            if (v2) {
              if (v2.nivel == 3) {
                vendedor2.comision_base = (parseFloat(porcentaje * comisionMax_nivel3) - vendedor.comision_base)
              } else {
                vendedor2.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor.comision_base);
              }
              cl.vendedores.push(vendedor2)
            }

            //COMISIÓN VENDEDOR 3 (NIVEL 4)
            if (v3) {
              vendedor3.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor2.comision_base - vendedor.comision_base);
              cl.vendedores.push(vendedor3)
            }

            break;

          //VENDEDOR PRINCIPAL NIVEL 3
          case 3:
            vendedor.comision_base = parseFloat(porcentaje * comisionMax_nivel3)
            cl.vendedores.push(vendedor)

            //COMISIÓN VENDEDOR 2 (NIVEL 4)
            if (v2) {
              vendedor2.comision_base = (cl.monto_aprobado - gastos_empresa - vendedor.comision_base);
              cl.vendedores.push(vendedor2)
            }

            break;
          
          //VENDEDOR PRINCIPAL NIVEL 4
          default:
            vendedor.comision_base = (cl.monto_aprobado - gastos_empresa);
            cl.vendedores.push(vendedor)

            break;
        }

      }

    } else {
      console.log("\n <<<<<<<<<<<<<<<< No hay coincidencias de vendedor >>>>>>>>>>>>>>>>>>>\n")
    }

    //Sumar comisiónes base de todos los vendedores
    cl.comision_total = cl.vendedores.map(item => item.comision_base).reduce((prev, curr) => prev + curr, 0);
    arrayVentas.push(cl)
    console.log("\n######################## ** INICIO ** DATOS VENTA CLIENTE + VENDEDORES ########################")
    console.log(cl)
    console.log("######################## ** FIN ** DATOS VENTA CLIENTE + VENDEDORES ########################\n")

  });

  res.render("./1-admin/ventas", { user: req.user, arrayVentas });
}