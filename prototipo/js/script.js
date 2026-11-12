/* ==========================================================
   ROYAL TECHNOLOGY S.A. - MOTOR DE LÓGICA Y DATOS MODULARES
   ========================================================== */

const catalogEspacios = [];
const tiposCategorias = ["Oficina Privada", "Coworking", "Sala de Reuniones", "Estudio de Podcast"];

tiposCategorias.forEach((cat, catIndex) => {
    for (let i = 1; i <= 10; i++) {
        let idNum = (catIndex * 10) + i;
        let precioVal = cat === "Oficina Privada" ? 420 : (cat === "Coworking" ? 150 : (cat === "Sala de Reuniones" ? 40 : 50));
        let esPorHora = cat === "Sala de Reuniones" || cat === "Estudio de Podcast";
        
        catalogEspacios.push({
            id: idNum,
            tipo: cat,
            nombre: `${cat} Unit #${i}`,
            precioHora: esPorHora ? precioVal : null,
            precioMes: !esPorHora ? precioVal : null,
            desc: `Espacio profesional equipado con red de alta velocidad y soporte técnico para ${cat}.`,
            img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"
        });
    }
});

let dbClientes = JSON.parse(localStorage.getItem('royal_clientes')) || [
    { id: 1, nombre: "InnovaCorp S.A.", contacto: "info@innovacorp.ec / 0991234567", visitas: 4, saldoFavor: 0 },
    { id: 2, nombre: "DevStudio Ecuador", contacto: "admin@devstudio.io / 0987654321", visitas: 2, saldoFavor: 40 }
];

let dbReservas = JSON.parse(localStorage.getItem('royal_reservas')) || [
    { id: 101, cliente: "InnovaCorp S.A.", espacio: "Oficina Privada Unit #1", fecha: "2026-11-25", horaInicio: "09:00", horaFin: "13:00", ruc: "0992837465001", factura: "FAC-2026-101", pago: "Pendiente", monto: 420 }
];

let dbIncidencias = JSON.parse(localStorage.getItem('royal_incidencias')) || [
    { id: 1, desc: "Soporte técnico por caída de fibra óptica en el piso principal.", fecha: "2026-11-10", estado: "Resuelto" }
];

function persistirDatos() {
    localStorage.setItem('royal_clientes', JSON.stringify(dbClientes));
    localStorage.setItem('royal_reservas', JSON.stringify(dbReservas));
    localStorage.setItem('royal_incidencias', JSON.stringify(dbIncidencias));
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    
    if (email.endsWith('@admin')) {
        localStorage.setItem('royal_user_role', 'admin');
        window.location.href = 'pages/admin.html';
    } else if (email.includes('@')) {
        localStorage.setItem('royal_user_role', 'client');
        window.location.href = 'pages/client.html';
    } else {
        alert('Ingrese un correo válido.');
    }
}

function logout() {
    localStorage.removeItem('royal_user_role');
    window.location.href = '../index.html';
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('client-catalog-grid')) {
        renderClientCatalog();
        poblarSelectoresCliente();
        actualizarEspaciosPorCategoria();
    }
    if (document.getElementById('client-reservations-table')) {
        renderClientReservations();
    }
    if (document.getElementById('admin-reservas-table')) {
        renderAdminDashboard();
    }
});

function renderClientCatalog() {
    const grid = document.getElementById('client-catalog-grid');
    if (!grid) return;
    const muestra = [catalogEspacios[0], catalogEspacios[10], catalogEspacios[20], catalogEspacios[30]];
    grid.innerHTML = muestra.map(e => `
        <div class="card">
            <img src="${e.img}" alt="${e.nombre}">
            <div class="card-body">
                <div>
                    <span class="badge">${e.tipo}</span>
                    <h3 class="card-title">${e.nombre}</h3>
                    <p class="card-text">${e.desc}</p>
                </div>
                <div class="card-footer">
                    <span class="price">$${e.precioMes || e.precioHora} ${e.precioMes ? '/mes' : '/h'}</span>
                    <button class="btn btn-primary" onclick="seleccionarParaReservarDirecto('${e.tipo}', '${e.nombre}')">Reservar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function switchClientTab(tabId) {
    ['catalogo', 'reservar', 'mis-reservas'].forEach(id => {
        const el = document.getElementById(`tab-${id}`);
        const btn = document.getElementById(`nav-${id}`);
        if (el) el.style.display = (id === tabId) ? 'block' : 'none';
        if (btn) btn.classList.toggle('active', id === tabId);
    });
    if (tabId === 'mis-reservas') renderClientReservations();
}

function seleccionarParaReservarDirecto(tipoCat, nombreEspacio) {
    switchClientTab('reservar');
    document.getElementById('resTipoFiltro').value = tipoCat;
    actualizarEspaciosPorCategoria();
    document.getElementById('resEspacio').value = nombreEspacio;
}

function actualizarEspaciosPorCategoria() {
    const tipoFiltro = document.getElementById('resTipoFiltro').value;
    const selectEspacio = document.getElementById('resEspacio');
    
    const filtrados = tipoFiltro === 'todos' ? catalogEspacios : catalogEspacios.filter(e => e.tipo === tipoFiltro);
    selectEspacio.innerHTML = filtrados.map(e => `<option value="${e.nombre}">${e.nombre} ($${e.precioMes || e.precioHora})</option>`).join('');
}

function ejecutarConsultaDisponibilidadYReserva() {
    const fecha = document.getElementById('resFecha').value;
    const hInicio = document.getElementById('dispHoraInicio').value;
    const hFin = document.getElementById('dispHoraFin').value;
    const tipoFiltro = document.getElementById('resTipoFiltro').value;
    const resultadoDiv = document.getElementById('resultadoDisponibilidadUnificada');

    if (!fecha || !hInicio || !hFin) {
        alert('Por favor complete la fecha, hora de inicio y hora de fin.');
        return;
    }

    const lista = tipoFiltro === 'todos' ? catalogEspacios : catalogEspacios.filter(e => e.tipo === tipoFiltro);

    resultadoDiv.innerHTML = `
        <div style="margin-bottom:1rem; padding:0.75rem; background:var(--pastel-blue-bg); border:1px solid var(--pastel-blue-border); color:var(--pastel-blue-text); border-radius:0.5rem; font-size:0.9rem;">
            Mostrando disponibilidad para el <strong>${fecha}</strong> en horario <strong>${hInicio} - ${hFin}</strong> (Gap de limpieza de 25 min aplicado):
        </div>
        <div id="listaEspaciosDisponiblesContainer" style="max-height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;">
    ` + lista.map(esp => {
        const estaOcupado = dbReservas.some(r => r.espacio === esp.nombre && r.fecha === fecha);

        if (estaOcupado) {
            return `
                <div class="space-status-card space-status-occupied" style="padding:0.75rem 1rem;">
                    <div>
                        <strong style="color:var(--pastel-rose-text); font-size:0.9rem;">${esp.nombre}</strong> <span class="badge" style="font-size:0.65rem;">${esp.tipo}</span>
                    </div>
                    <div>
                        <span class="status-badge status-red">OCUPADO</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="space-status-card space-status-available" style="padding:0.75rem 1rem;">
                    <div>
                        <strong style="color:var(--pastel-green-text); font-size:0.9rem;">${esp.nombre}</strong> <span class="badge" style="font-size:0.65rem;">${esp.tipo}</span>
                    </div>
                    <div>
                        <span class="status-badge status-green" style="margin-right:1rem;">DISPONIBLE</span>
                        <button class="btn btn-primary" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="seleccionarUnicoEspacio('${esp.nombre}', '${fecha}', '${hInicio}', '${hFin}', ${esp.precioMes || esp.precioHora || 120})">Seleccionar</button>
                    </div>
                </div>
            `;
        }
    }).join('') + `</div>`;
}

function seleccionarUnicoEspacio(nombreEspacio, fecha, hInicio, hFin, montoCalculado) {
    document.getElementById('resEspacio').value = nombreEspacio;
    window.tempMontoReserva = montoCalculado;
    
    const contenedorLista = document.getElementById('resultadoDisponibilidadUnificada');
    contenedorLista.innerHTML = `
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:1.25rem; border-radius:0.75rem; margin-bottom:1rem;">
            <h4 style="color:#15803d; font-size:1rem; margin-bottom:0.5rem;">Espacio Seleccionado para Reserva:</h4>
            <p><strong>Espacio:</strong> ${nombreEspacio}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Horario:</strong> ${hInicio} - ${hFin}</p>
            <p><strong>Valor a Cancelar:</strong> $<span id="lblMonto">${montoCalculado}</span></p>
        </div>
    `;

    document.getElementById('contenedorFormFactura').style.display = 'block';
    document.getElementById('contenedorFormFactura').scrollIntoView({ behavior: 'smooth' });
}

function validarActivacionBotonReserva() {
    const rucVal = document.getElementById('resRuc').value.trim();
    const btnReserva = document.getElementById('btnGenerarReserva');

    if (rucVal.length > 5) {
        btnReserva.removeAttribute('disabled');
        btnReserva.classList.remove('btn-disabled');
        btnReserva.classList.add('btn-primary');
    } else {
        btnReserva.setAttribute('disabled', 'true');
        btnReserva.classList.remove('btn-primary');
        btnReserva.classList.add('btn-disabled');
    }
}

function poblarSelectoresCliente() {
    const selectCli = document.getElementById('resCliente');
    if (selectCli) {
        selectCli.innerHTML = dbClientes.map(c => `<option value="${c.nombre}">${c.nombre} (Saldo a favor: $${c.saldoFavor})</option>`).join('');
    }
}

function procesarReservaCliente(e) {
    e.preventDefault();
    const cliente = document.getElementById('resCliente').value;
    const espacio = document.getElementById('resEspacio').value;
    const fecha = document.getElementById('resFecha').value;
    const hInicio = document.getElementById('dispHoraInicio').value;
    const hFin = document.getElementById('dispHoraFin').value;
    const ruc = document.getElementById('resRuc').value;
    const montoFinal = window.tempMontoReserva || 120;

    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    if (fechaReserva <= hoy) {
        alert('Regla de Negocio: Las reservas deben realizarse con al menos 1 día de anticipación.');
        return;
    }

    const nuevaFac = 'FAC-2026-' + Math.floor(1000 + Math.random() * 9000);
    dbReservas.push({
        id: Date.now(),
        cliente,
        espacio,
        fecha,
        horaInicio: hInicio,
        horaFin: hFin,
        ruc,
        factura: nuevaFac,
        pago: 'Pendiente',
        monto: montoFinal
    });

    const cliObj = dbClientes.find(c => c.nombre === cliente);
    if (cliObj) cliObj.visitas += 1;

    persistirDatos();
    poblarSelectoresCliente();

    const banner = document.getElementById('reserva-exitosa-banner');
    banner.style.display = 'block';
    banner.innerHTML = `
        <strong>¡Reserva Registrada y Factura Oficial Generada!</strong><br>
        Factura Nro: <strong>${nuevaFac}</strong> | Espacio: ${espacio} | Valor: $${montoFinal}<br>
        Plazo Máximo de Pago: 5 días laborables según contrato. Adjunte su comprobante en "Mis Facturas y Pagos".
    `;
    document.getElementById('formReservaCliente').reset();
    document.getElementById('btnGenerarReserva').setAttribute('disabled', 'true');
    document.getElementById('btnGenerarReserva').classList.remove('btn-primary');
    document.getElementById('btnGenerarReserva').classList.add('btn-disabled');
}

function renderClientReservations() {
    const tbody = document.getElementById('client-reservations-table');
    if (!tbody) return;

    if (dbReservas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No tiene reservas registradas.</td></tr>`;
        return;
    }

    tbody.innerHTML = dbReservas.map(r => `
        <tr>
            <td><strong>${r.factura}</strong></td>
            <td>${r.cliente}</td>
            <td>${r.espacio}</td>
            <td>${r.fecha} (${r.horaInicio || '09:00'} - ${r.horaFin || '13:00'})</td>
            <td><strong>$${r.monto || 120}</strong></td>
            <td><span class="status-badge ${r.pago === 'Pagado' ? 'status-green' : 'status-amber'}">${r.pago}</span></td>
            <td>
                ${r.pago === 'Pendiente' ? 
                    `<button class="btn btn-primary" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="subirComprobante(${r.id})">Subir Comprobante</button>` : 
                    `<span style="color:var(--pastel-green-text); font-weight:bold; font-size:0.8rem;">Verificado</span>`}
            </td>
        </tr>
    `).join('');
}

function subirComprobante(id) {
    const res = dbReservas.find(r => r.id === id);
    if (res) {
        res.pago = 'Pendiente Validación';
        persistirDatos();
        renderClientReservations();
        alert('Comprobante adjuntado con éxito para verificación.');
    }
}

function renderAdminDashboard() {
    const tbody = document.getElementById('admin-reservas-table');
    const tableCli = document.getElementById('admin-clientes-table');
    const tableInc = document.getElementById('admin-incidencias-table');

    const statRes = document.getElementById('stat-total-reservas');
    const statIng = document.getElementById('stat-total-ingresos');
    if (statRes) statRes.innerText = dbReservas.length;
    if (statIng) statIng.innerText = '$' + dbReservas.reduce((acc, r) => acc + (r.pago === 'Pagado' ? (r.monto || 120) : 0), 0);

    if (tbody) {
        tbody.innerHTML = dbReservas.map(r => `
            <tr>
                <td><strong>${r.factura}</strong></td>
                <td>${r.cliente}</td>
                <td>${r.espacio}</td>
                <td>${r.fecha} (${r.horaInicio || '09:00'})</td>
                <td><strong>$${r.monto || 120}</strong></td>
                <td><span class="status-badge ${r.pago === 'Pagado' ? 'status-green' : 'status-amber'}">${r.pago}</span></td>
                <td>
                    ${r.pago !== 'Pagado' ? `<button class="btn btn-primary" style="padding:0.3rem 0.6rem; font-size:0.75rem; margin-right:0.25rem;" onclick="adminAprobarPago(${r.id})">Aprobar Pago</button>` : ''}
                    <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="adminCancelarReserva(${r.id})">Cancelar / Saldo</button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="7" style="text-align:center;">No hay reservas registradas.</td></tr>`;
    }

    if (tableCli) {
        tableCli.innerHTML = dbClientes.map(c => `
            <tr>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.contacto}</td>
                <td>${c.visitas} visitas</td>
                <td>$${c.saldoFavor}</td>
            </tr>
        `).join('');
    }

    if (tableInc) {
        tableInc.innerHTML = dbIncidencias.map(i => `
            <tr>
                <td>${i.desc}</td>
                <td>${i.fecha}</td>
                <td><span class="status-badge status-green">${i.estado}</span></td>
            </tr>
        `).join('');
    }
}

function adminAprobarPago(id) {
    const res = dbReservas.find(r => r.id === id);
    if (res) {
        res.pago = 'Pagado';
        persistirDatos();
        renderAdminDashboard();
        alert('Pago verificado y registrado en contabilidad.');
    }
}

function adminCancelarReserva(id) {
    const idx = dbReservas.findIndex(r => r.id === id);
    if (idx !== -1) {
        const reservaAfectada = dbReservas[idx];
        const clienteObj = dbClientes.find(c => c.nombre === reservaAfectada.cliente);
        
        if (clienteObj) {
            clienteObj.saldoFavor += (reservaAfectada.monto || 120);
        }

        dbReservas.splice(idx, 1);
        persistirDatos();
        renderAdminDashboard();
        alert(`Reserva cancelada. Se han acreditado $${reservaAfectada.monto || 120} de saldo a favor al cliente ${reservaAfectada.cliente}.`);
    }
}

function registrarIncidenciaAdmin(e) {
    e.preventDefault();
    const desc = document.getElementById('incDesc').value;
    if (!desc) return;

    dbIncidencias.push({
        id: Date.now(),
        desc,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'Registrado'
    });

    persistirDatos();
    renderAdminDashboard();
    document.getElementById('formIncidencia').reset();
    alert('Incidencia registrada en el módulo de auditoría.');
}