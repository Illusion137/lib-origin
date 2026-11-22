import journal from './meta/_journal.json';
import m0000 from './0000_v2.sql';
import m0001 from './0001_lyrics_sync_status.sql';
import m0002 from './0002_drop_synced_lyrics_uri.sql';
import m0003 from './0003_user_track_credits.sql';
import m0004 from './0004_report_downloads.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004
    }
  }
  