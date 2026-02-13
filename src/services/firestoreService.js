import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "registros";

/**
 * Agrega un nuevo registro a Firestore
 */
export const addRegistro = async (userId, registroData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...registroData,
            userId,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error al añadir registro:", error);
        throw error;
    }
};

/**
 * Escucha cambios en tiempo real para los registros de un usuario específico
 */
export const subscribeToRegistros = (userId, callback) => {
    if (!userId) return () => { };

    const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        console.log(`[Firestore] Recibidos ${snapshot.docs.length} documentos para el usuario ${userId}`);
        const registros = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));
        callback(registros);
    }, (error) => {
        console.error("Error en la suscripción de Firestore:", error);
        if (error.code === 'failed-precondition') {
            console.warn("Falta un índice en Firestore para esta consulta. Revisa el link en el error de arriba.");
        }
    });
};

/**
 * Elimina un registro por ID
 */
export const deleteRegistro = async (registroId) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, String(registroId)));
    } catch (error) {
        console.error("Error al eliminar registro:", error);
        throw error;
    }
};

/**
 * Actualiza un registro existente
 */
export const updateRegistro = async (registroId, updateData) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, String(registroId));
        await updateDoc(docRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error al actualizar registro:", error);
        throw error;
    }
};
