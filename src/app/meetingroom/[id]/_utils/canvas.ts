import { fabric } from "fabric";
import Pako from "pako";

export const loadCanvasData = ({
  fabricCanvas,
  newData,
}: {
  fabricCanvas: fabric.Canvas;
  newData: Uint8Array;
}) => {
  const isCanvasDataChanged = newData.byteLength !== 0;

  if (isCanvasDataChanged) {
    const receiveObjects = JSON.parse(Pako.inflate(newData, { to: "string" }));
    const currentObjects = fabricCanvas.getObjects();

    const findUniqueObjects = (
      currentObjects: fabric.Object[],
      newObjects: fabric.Object[],
    ) => {
      // 객체를 식별하기 위한 고유 키 생성 함수
      const createObjectKey = (obj: fabric.Object) => {
        // Fabric.js 객체의 핵심 속성만 추출하여 키 생성
        const { type, left, top, width, height, scaleX, scaleY, angle } = obj;
        return `${type}-${left}-${top}-${width}-${height}-${scaleX}-${scaleY}-${angle}`;
      };

      // Map을 사용하여 현재 객체들의 키-값 쌍 저장
      const currentObjectsMap = new Map();
      currentObjects.forEach((obj) => {
        currentObjectsMap.set(createObjectKey(obj), obj);
      });

      // Map을 사용하여 새로운 객체들의 키-값 쌍 저장
      const newObjectsMap = new Map();
      newObjects.forEach((obj) => {
        newObjectsMap.set(createObjectKey(obj), obj);
      });

      // 삭제해야 할 객체 찾기 (현재 객체 중 새로운 객체에 없는 것)
      const objectsToDelete = currentObjects.filter(
        (obj) => !newObjectsMap.has(createObjectKey(obj)),
      );

      // 추가해야 할 객체 찾기 (새로운 객체 중 현재 객체에 없는 것)
      const objectsToAdd = newObjects.filter(
        (obj) => !currentObjectsMap.has(createObjectKey(obj)),
      );

      return [objectsToDelete, objectsToAdd];
    };
    const [deletedObjects, newObjects] = findUniqueObjects(
      currentObjects,
      receiveObjects,
    );

    const deleteObject = () => {
      for (let i = 0; i < deletedObjects.length; i++) {
        fabricCanvas.remove(deletedObjects[i]);
      }
    };
    const addObject = () => {
      fabric.util.enlivenObjects(
        newObjects,
        (objs: fabric.Object[]) => {
          objs.forEach((item) => {
            fabricCanvas.add(item);
          });
        },
        "",
      );
    };
    deleteObject();
    addObject();

    fabricCanvas.renderAll();
  }
};
