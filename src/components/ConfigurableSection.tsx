import { useState } from "react";
import { Plus, X, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  useConfigurableSection,
  useUpdateSectionHeaders,
  useAddSectionRow,
  useUpdateSectionRow,
  useDeleteSectionRow,
} from "@/hooks/useConfigurableSections";

interface ConfigurableSectionProps {
  sectionType: 'bizdev' | 'brand' | 'product';
  title: string;
}

export const ConfigurableSection = ({ sectionType, title }: ConfigurableSectionProps) => {
  const { data, isLoading } = useConfigurableSection(sectionType);
  const updateHeaders = useUpdateSectionHeaders();
  const addRow = useAddSectionRow();
  const updateRow = useUpdateSectionRow();
  const deleteRow = useDeleteSectionRow();

  const [editingHeaders, setEditingHeaders] = useState(false);
  const [tempHeaders, setTempHeaders] = useState<string[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [tempRowData, setTempRowData] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { section, rows } = data;
  const headers = section.column_headers;

  const handleEditHeaders = () => {
    setTempHeaders([...headers]);
    setEditingHeaders(true);
  };

  const handleSaveHeaders = () => {
    updateHeaders.mutate({ sectionId: section.id, headers: tempHeaders });
    setEditingHeaders(false);
  };

  const handleAddColumn = () => {
    setTempHeaders([...tempHeaders, `Column ${tempHeaders.length + 1}`]);
  };

  const handleRemoveColumn = (index: number) => {
    setTempHeaders(tempHeaders.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    const newRowData: Record<string, string> = {};
    headers.forEach(header => {
      newRowData[header] = "";
    });
    
    addRow.mutate({
      sectionId: section.id,
      rowData: newRowData,
      orderIndex: rows.length,
    });
  };

  const handleEditRow = (rowId: string, rowData: Record<string, string>) => {
    setEditingRow(rowId);
    setTempRowData({ ...rowData });
  };

  const handleSaveRow = () => {
    if (editingRow) {
      updateRow.mutate({ rowId: editingRow, rowData: tempRowData });
      setEditingRow(null);
    }
  };

  const handleDeleteRow = (rowId: string) => {
    deleteRow.mutate(rowId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditHeaders}
          disabled={editingHeaders}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Columns
        </Button>
      </CardHeader>
      <CardContent>
        {editingHeaders ? (
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {tempHeaders.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={header}
                    onChange={(e) => {
                      const newHeaders = [...tempHeaders];
                      newHeaders[index] = e.target.value;
                      setTempHeaders(newHeaders);
                    }}
                    className="w-32"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveColumn(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddColumn}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveHeaders}>Save Headers</Button>
              <Button variant="outline" onClick={() => setEditingHeaders(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {headers.map((header) => (
                      <TableCell key={`${row.id}-${header}`}>
                        {editingRow === row.id ? (
                          <Input
                            value={tempRowData[header] || ""}
                            onChange={(e) => {
                              setTempRowData({
                                ...tempRowData,
                                [header]: e.target.value,
                              });
                            }}
                          />
                        ) : (
                          row.row_data[header] || ""
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {editingRow === row.id ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleSaveRow}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingRow(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditRow(row.id, row.row_data)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRow(row.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};