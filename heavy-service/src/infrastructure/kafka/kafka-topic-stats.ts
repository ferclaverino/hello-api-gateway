import type { KafkaJS } from "@confluentinc/kafka-javascript";

type Admin = KafkaJS.Admin;
type PartitionMetadata = KafkaJS.PartitionMetadata;

export interface TopicPartitionStats {
  partition: number;
  leader: number;
  replicas: number[];
  isr: number[];
  offlineReplicas?: number[];
  low: string;
  high: string;
  offset: string;
}

export interface TopicStats {
  topic: string;
  partitions: TopicPartitionStats[];
}

export async function getTopicStats(admin: Admin): Promise<TopicStats[]> {
  const topics = await admin.listTopics();
  if (topics.length === 0) return [];

  const metadata = await admin.fetchTopicMetadata({ topics });

  const result: TopicStats[] = [];
  for (const topic of metadata) {
    const offsets = await admin.fetchTopicOffsets(topic.name);
    const offsetsByPartition = new Map<number, (typeof offsets)[number]>();
    for (const o of offsets) {
      offsetsByPartition.set(o.partition, o);
    }

    const partitions: TopicPartitionStats[] = topic.partitions.map(
      (p: PartitionMetadata) => {
        const o = offsetsByPartition.get(p.partitionId);
        return {
          partition: p.partitionId,
          leader: p.leader,
          replicas: p.replicas,
          isr: p.isr,
          offlineReplicas: p.offlineReplicas,
          low: o?.low ?? "-1",
          high: o?.high ?? "-1",
          offset: o?.offset ?? "-1",
        };
      },
    );

    result.push({ topic: topic.name, partitions });
  }

  return result;
}
