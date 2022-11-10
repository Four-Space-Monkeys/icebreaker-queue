import * as dotenv from 'dotenv';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';

dotenv.config();

const role = RtcRole.PUBLISHER;

export default function generateToken(uid: number, channelName: string) {
  const expirationTimeInSeconds = 300;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    process.env.APP_ID,
    process.env.PRIMARY_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs,
  );
}
