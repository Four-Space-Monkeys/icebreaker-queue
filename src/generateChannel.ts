// for now just current timestamp as string - probably sufficient as we won't have multiple
// people creating calls at the same moment?
export default function generateChannel() {
  return Date.now().toString();
}
