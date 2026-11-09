import { Car, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Field, TextInput } from '../ui/Field';

export interface CustomerDefaults {
  customerName?: string | null;
  customerPhone?: string | null;
  customerVat?: string | null;
  carMake?: string | null;
  carModel?: string | null;
  carYear?: string | null;
  plateNumber?: string | null;
  vin?: string | null;
  odometer?: number | null;
}

export function CustomerFields({ d = {}, errors = {}, showVat }: { d?: CustomerDefaults; errors?: Record<string, string>; showVat?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-headline">
          <span className="grid size-8 place-items-center rounded-lg rounded-es-sig bg-primary-tint text-icon-brand">
            <User className="size-[18px]" aria-hidden="true" />
          </span>
          بيانات العميل
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم العميل" name="customerName" required error={errors.customerName} className="sm:col-span-2">
            <TextInput id="customerName" name="customerName" defaultValue={d.customerName ?? ''} required aria-invalid={!!errors.customerName} />
          </Field>
          <Field label="رقم الجوال" name="customerPhone" error={errors.customerPhone}>
            <TextInput id="customerPhone" name="customerPhone" inputMode="tel" dir="ltr" placeholder="05xxxxxxxx" defaultValue={d.customerPhone ?? ''} aria-invalid={!!errors.customerPhone} />
          </Field>
          {showVat ? (
            <Field label="الرقم الضريبي للعميل" name="customerVat" hint="للشركات فقط">
              <TextInput id="customerVat" name="customerVat" dir="ltr" inputMode="numeric" defaultValue={d.customerVat ?? ''} />
            </Field>
          ) : null}
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-headline">
          <span className="grid size-8 place-items-center rounded-lg rounded-es-sig bg-primary-tint text-icon-brand">
            <Car className="size-[18px]" aria-hidden="true" />
          </span>
          بيانات السيارة
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="الشركة المصنعة" name="carMake">
            <TextInput id="carMake" name="carMake" placeholder="تويوتا" defaultValue={d.carMake ?? ''} list="car-makes" />
          </Field>
          <Field label="الطراز" name="carModel">
            <TextInput id="carModel" name="carModel" placeholder="كامري" defaultValue={d.carModel ?? ''} />
          </Field>
          <Field label="سنة الصنع" name="carYear">
            <TextInput id="carYear" name="carYear" inputMode="numeric" dir="ltr" placeholder="2022" defaultValue={d.carYear ?? ''} />
          </Field>
          <Field label="رقم اللوحة" name="plateNumber">
            <TextInput id="plateNumber" name="plateNumber" placeholder="أ ب ج 1234" defaultValue={d.plateNumber ?? ''} />
          </Field>
          <Field label="قراءة العداد (كم)" name="odometer" error={errors.odometer}>
            <TextInput id="odometer" name="odometer" inputMode="numeric" dir="ltr" defaultValue={d.odometer ?? ''} aria-invalid={!!errors.odometer} />
          </Field>
          <Field label="رقم الهيكل (VIN)" name="vin">
            <TextInput id="vin" name="vin" dir="ltr" defaultValue={d.vin ?? ''} />
          </Field>
        </div>
        <datalist id="car-makes">
          {['تويوتا', 'هيونداي', 'نيسان', 'كيا', 'فورد', 'شفروليه', 'لكزس', 'هوندا', 'مازدا', 'جي إم سي', 'ميتسوبيشي', 'مرسيدس', 'بي إم دبليو', 'جيلي', 'شانجان', 'إم جي'].map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </Card>
    </div>
  );
}
