// รูปโปรไฟล์วงกลม ถ้าไม่มีรูปแสดงตัวอักษรแรกของชื่อบนพื้นไล่สี
export default function Avatar({ user, size = 40 }) {
  const label = (user.nickname || user.name || '?').trim().charAt(0).toUpperCase();
  const style = { width: size, height: size, fontSize: Math.round(size * 0.45) };
  return user.picture ? (
    <img className="avatar" src={user.picture} alt="" style={style} referrerPolicy="no-referrer" />
  ) : (
    <span className="avatar ph" style={style} aria-hidden="true">{label}</span>
  );
}
