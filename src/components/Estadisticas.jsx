import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, BarChart2, Activity, Calendar, Zap, Smile, Edit, Trash2, Download, Upload, Shield } from 'lucide-react';
import { DISTORSIONES } from '../data/distorsiones';
import { EMOCIONES } from '../data/emociones';

const MOODS_META = {
  feliz: { label: 'Feliz', color: '#10b981' },
  triste: { label: 'Triste', color: '#3b82f6' },
  ansioso: { label: 'Ansioso', color: '#f59e0b' },
  enojado: { label: 'Enojado', color: '#ef4444' },
  neutro: { label: 'Neutro', color: '#64748b' },
};

export default function Estadisticas({ registros, onEdit, onDelete, onExport, onImport, showToast }) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          onImport(json);
        } catch (err) {
          showToast("Error al leer el archivo JSON: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    }
    // Limpiar el input para permitir subir el mismo archivo otra vez si se desea
    event.target.value = '';
  };
  if (registros.length === 0) {
    return (
      <div className="fade-in">
        <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
          <Calendar size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h3>Aún no hay registros</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Comienza por registrar tu primer estado de ánimo para ver las estadísticas.</p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={24} color="var(--success)" />
            <h4 style={{ margin: 0 }}>Copia de Seguridad y Respaldo</h4>
          </div>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            ¿Tienes un respaldo? Impórtalo aquí para restaurar tus registros anteriores.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ flex: 1, minWidth: '180px' }}>
              <Upload size={18} />
              Importar datos (.json)
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalRegistros = registros.length;
  const promedioIntensidad = (registros.reduce((acc, curr) => acc + Number(curr.intensidad), 0) / totalRegistros).toFixed(1);
  
  // Mood counts
  const moodCounts = registros.reduce((acc, curr) => {
    acc[curr.estadoAnimo] = (acc[curr.estadoAnimo] || 0) + 1;
    return acc;
  }, {});

  const moodData = Object.entries(moodCounts).map(([key, value]) => ({
    name: MOODS_META[key]?.label || key,
    value: value,
    key: key
  })).sort((a, b) => b.value - a.value);

  const moodMasFrecuente = moodData[0]?.name || 'N/A';

  // Intensity over time data
  const chartData = registros
    .slice(-10) // last 10
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map(r => ({
      fecha: r.fecha.split('-').slice(1).reverse().join('/'), // DD/MM
      intensidad: Number(r.intensidad)
    }));

  // Generic counter for arrays
  const countArrayItems = (data, key) => {
    return data.reduce((acc, curr) => {
      if (curr[key] && curr[key].length > 0) {
        curr[key].forEach(id => {
          acc[id] = (acc[id] || 0) + 1;
        });
      }
      return acc;
    }, {});
  };

  // Analysis for Distortions
  const distortionCounts = countArrayItems(registros, 'distorsiones');
  const distortionData = Object.entries(distortionCounts).map(([id, count]) => ({
    name: DISTORSIONES.find(d => d.id === id)?.titulo || id,
    value: count
  })).sort((a, b) => b.value - a.value);

  // Analysis for Emotions
  const emotionCounts = countArrayItems(registros, 'emocionesSeleccionadas');
  const emotionData = Object.entries(emotionCounts).map(([id, count]) => ({
    name: EMOCIONES.find(e => e.id === id)?.titulo || id,
    value: count
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <TrendingUp size={28} color="var(--accent-primary)" />
        Resumen Estadístico
      </h2>

      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity color="var(--accent-primary)" size={24} />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Registros</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalRegistros}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Smile color="var(--success)" size={24} />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Felicidad Media</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(10 - promedioIntensidad).toFixed(1)}/10</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Calendar color="var(--accent-secondary)" size={24} />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Más Frecuente</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{moodMasFrecuente}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h4 style={{ marginBottom: '1.5rem' }}>Distribución de Ánimo</h4>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="value">
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MOODS_META[entry.key]?.color || 'var(--accent-primary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '1.5rem' }}>Evolución de Intensidad (Últimos 10)</h4>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="fecha" stroke="#94a3b8" />
                <YAxis domain={[0, 10]} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="intensidad" 
                    stroke="var(--accent-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--bg-primary)', stroke: 'var(--accent-primary)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        {/* Emotions Analysis */}
        <div className="card">
          <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smile size={20} color="var(--accent-secondary)" />
            Frecuencia de Emociones
          </h4>
          {emotionData.length > 0 ? (
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Selecciona emociones en tus registros para verlas aquí.</p>
          )}
        </div>

        {/* Distortions Analysis */}
        <div className="card">
          <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="var(--warning)" />
            Top Distorsiones
          </h4>
          {distortionData.length > 0 ? (
            <div style={{ height: '30px', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distortionData.slice(0, 5)} layout="vertical" margin={{ left: 30, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#94a3b8" 
                    width={100} 
                    fontSize={10}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
                    itemStyle={{ color: 'var(--warning)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {distortionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${40 + index * 20}, 70%, 50%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Registra distorsiones para ver el análisis de sesgos.</p>
          )}
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>Historial Detallado</h4>
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Fecha</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Ánimo</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Emociones / Distorsiones</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Situación</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-secondary)' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {registros.slice().reverse().slice(0, 8).map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.75rem' }}>{r.fechaFormateada}</td>
                            <td style={{ padding: '0.75rem' }}>
                                <span style={{ color: MOODS_META[r.estadoAnimo]?.color, fontWeight: 'bold' }}>
                                    {MOODS_META[r.estadoAnimo]?.label}
                                </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                  {r.emocionesSeleccionadas?.map(id => (
                                    <span key={id} style={{ border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                                      {EMOCIONES.find(e => e.id === id)?.titulo}
                                    </span>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                  {r.distorsiones?.map(id => (
                                    <span key={id} style={{ border: '1px solid var(--warning)', color: 'var(--warning)', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                                      {DISTORSIONES.find(d => d.id === id)?.titulo.split(' ')[0]}...
                                    </span>
                                  ))}
                                </div>
                            </td>
                            <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.situacion}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button 
                                        onClick={() => onEdit(r)} 
                                        className="btn btn-secondary" 
                                        style={{ padding: '0.4rem', backgroundColor: 'var(--bg-tertiary)' }}
                                        title="Editar"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(r.id)} 
                                        className="btn btn-secondary" 
                                        style={{ padding: '0.4rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={24} color="var(--success)" />
          <h4 style={{ margin: 0 }}>Copia de Seguridad y Respaldo</h4>
        </div>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Exporta tus datos a un archivo JSON para tener un respaldo local o impórtalos para restaurar una copia previa.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={onExport} className="btn btn-secondary" style={{ flex: 1, minWidth: '180px' }}>
            <Download size={18} />
            Exportar datos (.json)
          </button>
          
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ flex: 1, minWidth: '180px' }}>
            <Upload size={18} />
            Importar datos (.json)
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}
