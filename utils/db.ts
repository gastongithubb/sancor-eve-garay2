// db.ts
import { createClient, Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { eq, and, desc } from 'drizzle-orm';
import { config } from './config';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

console.log('Configuración de la base de datos:', {
  url: config.tursoConnectionUrl || 'NO CONFIGURADO',
  authToken: config.tursoAuthToken ? 'CONFIGURADO (oculto)' : 'NO CONFIGURADO'
});

let client: Client | null = null;
export let db: LibSQLDatabase | null = null;

let retryCount = 0;
const MAX_RETRIES = 3;

const initializeDb = async (): Promise<void> => {
  try {
    if (!config.tursoConnectionUrl) {
      throw new Error('URL de conexión a Turso no configurada');
    }
    if (!config.tursoAuthToken) {
      throw new Error('Token de autenticación de Turso no configurado');
    }

    console.log('Intentando crear cliente con:', {
      url: config.tursoConnectionUrl || 'NO CONFIGURADO',
      authToken: config.tursoAuthToken ? 'CONFIGURADO (oculto)' : 'NO CONFIGURADO'
    });
    
    client = createClient({
      url: config.tursoConnectionUrl,
      authToken: config.tursoAuthToken
    });
    
    console.log('Cliente creado exitosamente');

    db = drizzle(client);

    console.log('Cliente de base de datos y drizzle inicializados correctamente');
    retryCount = 0;
  } catch (error) {
    console.error('Error al inicializar el cliente de base de datos:', error);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Reintentando conexión (intento ${retryCount} de ${MAX_RETRIES})...`);
      setTimeout(initializeDb, 5000);
    } else {
      console.error('Se alcanzó el número máximo de intentos de reconexión');
      client = null;
      db = null;
    }
  }
};

initializeDb();

// Función para verificar y reiniciar la conexión si es necesario
const ensureConnection = async (): Promise<void> => {
  if (!db) {
    console.log('La conexión a la base de datos no está disponible. Intentando reconectar...');
    await initializeDb();
  }
};

// Table definitions
export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  dni: text('dni').notNull(),
  entryTime: text('entry_time').notNull(),
  exitTime: text('exit_time').notNull(),
  hoursWorked: integer('hours_worked').notNull(),
  xLite: text('x_lite').notNull()
});

export const breakSchedules = sqliteTable('break_schedules', {
  id: integer('id').primaryKey(),
  employeeId: integer('employee_id').notNull(),
  day: text('day').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  week: integer('week').notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  responses: integer('responses').notNull().default(0),
  nps: integer('nps').notNull().default(0),
  csat: integer('csat').notNull().default(0),
  rd: integer('rd').notNull().default(0),
});

export const news = sqliteTable('news', {
  id: integer('id').primaryKey(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  publishDate: text('publish_date').notNull(),
  estado: text('estado').notNull().default('activa'),
});

export const npsTrimestral = sqliteTable('nps_trimestral', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  month: text('month').notNull(),
  nps: integer('nps').notNull(),
});

// Type definitions
export type EmployeeRow = typeof employees.$inferSelect;
export type BreakScheduleRow = typeof breakSchedules.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type NovedadesRow = {
  id: number;
  url: string;
  title: string;
  publishDate: string;
  estado: 'activa' | 'actualizada' | 'fuera_de_uso';
};
export type NPSTrimestralRow = typeof npsTrimestral.$inferSelect;

// Database operations
export async function ensureTablesExist(): Promise<void> {
  if (!client) {
    console.error('La conexión a la base de datos no está disponible');
    return;
  }
  try {
    console.log('Iniciando la verificación de tablas...');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        dni TEXT NOT NULL,
        entry_time TEXT NOT NULL,
        exit_time TEXT NOT NULL,
        hours_worked INTEGER NOT NULL,
        x_lite TEXT NOT NULL
      )
    `);
    console.log('Tabla employees verificada/creada');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS break_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        day TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        week INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL
      )
    `);
    console.log('Tabla break_schedules verificada/creada');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        responses INTEGER NOT NULL DEFAULT 0,
        nps INTEGER NOT NULL DEFAULT 0,
        csat INTEGER NOT NULL DEFAULT 0,
        rd INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log('Tabla users verificada/creada');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        publish_date TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'activa'
      )
    `);
    console.log('Tabla news verificada/creada');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS nps_trimestral (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        nps INTEGER NOT NULL
      )
    `);
    console.log('Tabla nps_trimestral verificada/creada');

    console.log('Inicialización de la base de datos completada con éxito');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Employee operations
export async function getEmployees(): Promise<EmployeeRow[]> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await ensureTablesExist();
    return await db.select().from(employees).all();
  } catch (error: unknown) {
    console.error('Error al obtener empleados:', error);
    throw new Error(`No se pudieron obtener los empleados: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addEmployee(employee: Omit<EmployeeRow, 'id'>): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await ensureTablesExist();
    await db.insert(employees).values(employee).run();
  } catch (error: unknown) {
    console.error('Error al agregar empleado:', error);
    throw new Error(`No se pudo agregar el empleado: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Break schedule operations
export async function getBreakSchedules(employeeId: number, month: number, year: number): Promise<BreakScheduleRow[]> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await ensureTablesExist();
    return await db.select()
      .from(breakSchedules)
      .where(and(
        eq(breakSchedules.employeeId, employeeId),
        eq(breakSchedules.month, month),
        eq(breakSchedules.year, year)
      ))
      .all();
  } catch (error: unknown) {
    console.error('Error al obtener horarios de break:', error);
    throw new Error(`No se pudieron obtener los horarios de break: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateBreakSchedule(schedule: Omit<BreakScheduleRow, 'id'>): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    console.log('Intentando actualizar horario de break:', schedule);
    
    const result = await db
      .update(breakSchedules)
      .set({
        startTime: schedule.startTime,
        endTime: schedule.endTime
      })
      .where(and(
        eq(breakSchedules.employeeId, schedule.employeeId),
        eq(breakSchedules.day, schedule.day),
        eq(breakSchedules.week, schedule.week),
        eq(breakSchedules.month, schedule.month),
        eq(breakSchedules.year, schedule.year)
      ))
      .run();

    if (result.rowsAffected === 0) {
      await db.insert(breakSchedules)
        .values(schedule)
        .run();
    }

    console.log('Horario de break actualizado o insertado con éxito');
  } catch (error: unknown) {
    console.error('Error detallado al actualizar horario de break:', error);
    throw new Error(`No se pudo actualizar el horario de break: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// User operations
export async function getUsers(): Promise<UserRow[]> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    console.log('Iniciando getUsers()...');
    await ensureTablesExist();
    console.log('Tablas verificadas, procediendo a obtener usuarios...');
    const result = await db.select().from(users).all();
    console.log('Usuarios obtenidos:', result.length);
    return result;
  } catch (error: unknown) {
    console.error('Error detallado al obtener usuarios:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw new Error(`No se pudieron obtener los usuarios: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateUser(user: UserRow): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await db
      .update(users)
      .set(user)
      .where(eq(users.id, user.id))
      .run();
  } catch (error: unknown) {
    console.error('Error al actualizar usuario:', error);
    throw new Error(`No se pudo actualizar el usuario: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function createUser(user: Omit<UserRow, 'id'>): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await ensureTablesExist();
    await db.insert(users).values(user).run();
  } catch (error: unknown) {
    console.error('Error al crear usuario:', error);
    throw new Error(`No se pudo crear el usuario: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// News operations
export async function getNews(page: number = 1, limit: number = 10): Promise<NovedadesRow[]> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    console.log(`Fetching news from database. Page: ${page}, Limit: ${limit}`);
    await ensureTablesExist();
    const offset = (page - 1) * limit;
    console.log(`Offset: ${offset}`);
    const result = await db.select()
      .from(news)
      .limit(limit)
      .offset(offset)
      .all();
    console.log(`Retrieved ${result.length} news items from database`);
    return result.map((item: any) => ({
      ...item,
      estado: item.estado as NovedadesRow['estado']
    }));
  } catch (error: unknown) {
    console.error('Error al obtener novedades:', error);
    throw new Error(`No se pudieron obtener las novedades: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addNews(newsItem: Omit<NovedadesRow, 'id'>): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await ensureTablesExist();
    await db.insert(news).values(newsItem).run();
  } catch (error: unknown) {
    console.error('Error al agregar novedad:', error);
    throw new Error(`No se pudo agregar la novedad: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteNews(id: number): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await db.delete(news).where(eq(news.id, id)).run();
  } catch (error: unknown) {
    console.error('Error al eliminar novedad:', error);
    throw new Error(`No se pudo eliminar la novedad: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateNewsStatus(id: number, newStatus: NovedadesRow['estado']): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await db.update(news)
      .set({ estado: newStatus })
      .where(eq(news.id, id))
      .run();
    console.log(`Estado de la noticia ${id} actualizado a ${newStatus}`);
  } catch (error: unknown) {
    console.error('Error al actualizar el estado de la noticia:', error);
    throw new Error(`No se pudo actualizar el estado de la noticia: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateNews(newsItem: NovedadesRow): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await db.update(news)
      .set({
        url: newsItem.url,
        title: newsItem.title,
        publishDate: newsItem.publishDate,
        estado: newsItem.estado
      })
      .where(eq(news.id, newsItem.id))
      .run();
    console.log(`Noticia ${newsItem.id} actualizada con éxito`);
  } catch (error: unknown) {
    console.error('Error al actualizar la noticia:', error);
    throw new Error(`No se pudo actualizar la noticia: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// NPS Trimestral operations
export async function getNPSTrimestral(userId: number): Promise<NPSTrimestralRow[]> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    await ensureTablesExist();
    return await db.select()
      .from(npsTrimestral)
      .where(eq(npsTrimestral.userId, userId))
      .orderBy(desc(npsTrimestral.month))
      .limit(3)
      .all();
  } catch (error: unknown) {
    console.error('Error al obtener NPS trimestral:', error);
    throw new Error(`No se pudo obtener el NPS trimestral: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateNPSTrimestral(userId: number, month: string, nps: number): Promise<void> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    const result = await db
      .insert(npsTrimestral)
      .values({ userId, month, nps })
      .onConflictDoUpdate({
        target: [npsTrimestral.userId, npsTrimestral.month],
        set: { nps }
      })
      .run();
    console.log(`NPS trimestral actualizado para el usuario ${userId} en el mes ${month}`);
  } catch (error: unknown) {
    console.error('Error al actualizar NPS trimestral:', error);
    throw new Error(`No se pudo actualizar el NPS trimestral: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Función para obtener estadísticas generales de usuarios
export async function getUserStatistics(): Promise<{ totalUsers: number, averageNPS: number, averageCSAT: number, averageRD: number }> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    const result = await db.select({
      totalUsers: sql<number>`COALESCE(COUNT(*), 0)`,
      averageNPS: sql<number>`COALESCE(AVG(nps), 0)`,
      averageCSAT: sql<number>`COALESCE(AVG(csat), 0)`,
      averageRD: sql<number>`COALESCE(AVG(rd), 0)`
    }).from(users).get();
  
    if (!result) {
      throw new Error('No se obtuvieron resultados de la consulta');
    }
  
    return {
      totalUsers: Number(result.totalUsers),
      averageNPS: Number(result.averageNPS),
      averageCSAT: Number(result.averageCSAT),
      averageRD: Number(result.averageRD)
    };
  } catch (error: unknown) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    throw new Error(`No se pudieron obtener las estadísticas de usuarios: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Función para obtener el top 5 de empleados con más horas trabajadas
export async function getTopEmployees(): Promise<EmployeeRow[]> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    return await db.select()
      .from(employees)
      .orderBy(desc(employees.hoursWorked))
      .limit(5)
      .all();
  } catch (error: unknown) {
    console.error('Error al obtener top empleados:', error);
    throw new Error(`No se pudo obtener el top de empleados: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Función para obtener resumen de horarios de break por semana
export async function getWeeklyBreakSummary(week: number, year: number): Promise<{ day: string, totalBreakTime: number }[]> {
  await ensureConnection();
  if (!db) {
    throw new Error('La conexión a la base de datos no está disponible');
  }
  try {
    const breakSummary = await db.select({
      day: breakSchedules.day,
      totalBreakTime: sql<number>`SUM((julianday(end_time) - julianday(start_time)) * 24 * 60)`
    })
    .from(breakSchedules)
    .where(and(
      eq(breakSchedules.week, week),
      eq(breakSchedules.year, year)
    ))
    .groupBy(breakSchedules.day)
    .all();

    return breakSummary;
  } catch (error: unknown) {
    console.error('Error al obtener resumen semanal de breaks:', error);
    throw new Error(`No se pudo obtener el resumen semanal de breaks: ${error instanceof Error ? error.message : String(error)}`);
  }
}
