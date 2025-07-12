export function transformarFilas(result: any) {
    if (!result || !result.rows || !result.columns) return [];
  
    return result.rows.map((row: any[]) => {
      const obj: any = {};
      result.columns.forEach((col: string, index: number) => {
        obj[col] = row[index];
      });
      return obj;
    });
  }
  